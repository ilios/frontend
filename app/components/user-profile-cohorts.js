/* eslint ember/order-in-components: 0 */
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import RSVP from 'rsvp';
import { computed } from '@ember/object';
import { isEmpty, isPresent } from '@ember/utils';
import { task, timeout } from 'ember-concurrency';

const { Promise, filter } = RSVP;

export default Component.extend({
  currentUser: service(),

  didReceiveAttrs(){
    this._super(...arguments);
    const user = this.get('user');
    if (isPresent(user)) {
      this.get('setup').perform(user);
    }
  },

  classNameBindings: [':user-profile-cohorts', ':large-component', 'hasSavedRecently:has-saved:has-not-saved'],

  user: null,
  isManaging: false,
  isManageable: false,
  cohorts: null,
  schools: null,
  selectedSchoolId: null,
  primaryCohort: null,
  hasSavedRecently: false,
  finishedSetup: false,

  setup: task(function * (user){
    this.set('finishedSetup', false);
    const currentUser = this.get('currentUser');
    const cohorts = yield user.get('cohorts');
    const selectedCohorts = cohorts.toArray();
    const primaryCohort = yield user.get('primaryCohort');
    const sessionUser = yield currentUser.get('model');
    const userSchools = yield sessionUser.get('schools');
    const primarySchool = yield sessionUser.get('school');

    this.set('selectedCohorts', selectedCohorts);
    this.set('primaryCohort', primaryCohort);
    this.set('schools', userSchools);
    this.set('selectedSchoolId', primarySchool.get('id'));

    //preload relationships for selected cohorts to make rendering smoother
    for (let i = 0; i < selectedCohorts.length; i++) {
      yield selectedCohorts[i].get('school');
    }

    this.set('finishedSetup', true);
  }),

  save: task(function * (){
    const finishedSetup = this.get('finishedSetup');
    if (!finishedSetup) {
      return;
    }
    const user = this.get('user');
    const selectedCohorts = this.get('selectedCohorts');
    const primaryCohort = this.get('primaryCohort');

    user.set('primaryCohort', primaryCohort);

    let userCohorts = yield user.get('cohorts');
    userCohorts.clear();
    userCohorts.pushObjects(selectedCohorts);

    yield user.save();
    this.get('setIsManaging')(false);
    this.set('hasSavedRecently', true);
    yield timeout(500);
    this.set('hasSavedRecently', false);

  }).drop(),

  selectedSchool: computed('selectedSchoolId', 'schools.[]', function(){
    const selectedSchoolId = this.get('selectedSchoolId');
    const schools = this.get('schools');
    return schools.findBy('id', selectedSchoolId);
  }),

  assignableCohorts: computed('currentUser.cohortsInAllAssociatedSchools.[]', 'selectedCohorts.[]', function(){
    const currentUser = this.get('currentUser');
    const selectedCohorts = this.get('selectedCohorts');
    return new Promise(resolve => {
      currentUser.get('cohortsInAllAssociatedSchools').then(usableCohorts => {
        filter(usableCohorts, cohort => {
          return new Promise(resolve => {
            cohort.get('programYear').then(programYear => {
              resolve(
                programYear.get('published') &&
                !programYear.get('archived') &&
                !selectedCohorts.includes(cohort)
              );
            });
          });
        }).then(assignableCohorts => {
          resolve(assignableCohorts);
        });
      });
    });
  }),

  assignableCohortsForSelectedSchool: computed('assignableCohorts.[]', 'selectedSchool', function(){
    const selectedSchool = this.get('selectedSchool');
    return new Promise(resolve => {
      this.get('assignableCohorts').then(assignableCohorts => {
        filter(assignableCohorts, cohort => {
          return new Promise(resolve => {
            cohort.get('school').then(school => {
              resolve(school.get('id') === selectedSchool.get('id'));
            });
          });
        }).then(filteredCohorts => {
          resolve(filteredCohorts);
        });
      });
    });
  }),

  secondaryCohorts: computed('primaryCohort', 'selectedCohorts.[]', function(){
    const primaryCohort = this.get('primaryCohort');
    const selectedCohorts = this.get('selectedCohorts');
    if (isEmpty(primaryCohort)) {
      return selectedCohorts;
    }

    return selectedCohorts.filter(cohort => cohort.get('id') != primaryCohort.get('id'));
  }),

  actions: {
    removeSelectedCohort(cohort){
      this.get('selectedCohorts').removeObject(cohort);
    },
    addSelectedCohort(cohort){
      this.get('selectedCohorts').pushObject(cohort);
    },
  }
});
