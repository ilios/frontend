/* eslint ember/order-in-components: 0 */
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { all, filter } from 'rsvp';
import { computed } from '@ember/object';
import { isEmpty, isPresent } from '@ember/utils';
import { task, timeout } from 'ember-concurrency';

export default Component.extend({
  currentUser: service(),
  permissionChecker: service(),
  store: service(),

  didReceiveAttrs(){
    this._super(...arguments);
    const user = this.get('user');
    if (isPresent(user)) {
      this.get('setup').perform(user);
    }
  },

  classNameBindings: [':user-profile-cohorts', ':small-component', 'hasSavedRecently:has-saved:has-not-saved'],

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
    const store = this.get('store');
    const currentUser = this.get('currentUser');
    const permissionChecker = this.get('permissionChecker');

    const cohorts = yield user.get('cohorts');
    const selectedCohorts = cohorts.toArray();
    const primaryCohort = yield user.get('primaryCohort');

    const sessionUser = yield currentUser.get('model');
    const primarySchool = yield sessionUser.get('school');

    const allCohorts = yield store.findAll('cohort', { reload: true });
    const allSchools = yield store.findAll('school', { reload: true });
    const schoolsWithUpdateUserPermission = yield filter(allSchools.toArray(), async school => {
      return permissionChecker.canUpdateUserInSchool(school);
    });

    this.set('selectedCohorts', selectedCohorts);
    this.set('primaryCohort', primaryCohort);
    this.set('schools', schoolsWithUpdateUserPermission);
    this.set('allCohorts', allCohorts);
    this.set('selectedSchoolId', primarySchool.get('id'));

    //preload relationships for cohorts to make rendering smoother
    yield all(allCohorts.mapBy('school'));

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

  assignableCohorts: computed('allCohorts.[]', 'selectedCohorts.[]', async function () {
    const cohorts = await this.get('allCohorts');
    const selectedCohorts = this.get('selectedCohorts') || [];

    return cohorts.filter(cohort => !selectedCohorts.includes(cohort));
  }),

  assignableCohortsForSelectedSchool: computed('assignableCohorts.[]', 'selectedSchool', async function(){
    const selectedSchool = this.get('selectedSchool');
    const assignableCohorts = await this.get('assignableCohorts');

    return filter(assignableCohorts, async cohort => {
      const school = await cohort.get('school');
      return school.get('id') === selectedSchool.get('id');
    });
  }),

  secondaryCohorts: computed('primaryCohort', 'selectedCohorts.[]', function(){
    const primaryCohort = this.get('primaryCohort');
    const selectedCohorts = this.get('selectedCohorts');
    if (isEmpty(primaryCohort)) {
      return selectedCohorts;
    }

    return selectedCohorts.filter(cohort => {
      return cohort.get('id') != primaryCohort.get('id');
    });
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
