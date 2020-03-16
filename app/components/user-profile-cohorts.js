import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { isEmpty, isPresent } from '@ember/utils';
import { all, filter } from 'rsvp';
import { task, timeout } from 'ember-concurrency';

export default Component.extend({
  currentUser: service(),
  permissionChecker: service(),

  store: service(),

  tagName: "",
  cohorts: null,
  finishedSetup: false,
  hasSavedRecently: false,
  isManageable: false,
  isManaging: false,
  primaryCohort: null,
  schools: null,
  selectedSchoolId: null,
  user: null,

  selectedSchool: computed('selectedSchoolId', 'schools.[]', function() {
    const selectedSchoolId = this.selectedSchoolId;
    const schools = this.schools;
    return schools.findBy('id', selectedSchoolId);
  }),

  assignableCohorts: computed('allCohorts.[]', 'selectedCohorts.[]', async function() {
    const cohorts = await this.allCohorts;
    const selectedCohorts = this.selectedCohorts || [];
    return cohorts.filter(cohort => !selectedCohorts.includes(cohort));
  }),

  assignableCohortsForSelectedSchool: computed('assignableCohorts.[]', 'selectedSchool', async function() {
    const selectedSchool = this.selectedSchool;
    const assignableCohorts = await this.assignableCohorts;
    return filter(assignableCohorts, async cohort => {
      const school = await cohort.get('school');
      return school.get('id') === selectedSchool.get('id');
    });
  }),

  secondaryCohorts: computed('primaryCohort', 'selectedCohorts.[]', function() {
    const primaryCohort = this.primaryCohort;
    const selectedCohorts = this.selectedCohorts;
    if (isEmpty(primaryCohort)) {
      return selectedCohorts;
    }

    return selectedCohorts.filter(cohort => {
      return cohort.get('id') != primaryCohort.get('id');
    });
  }),

  didReceiveAttrs(){
    this._super(...arguments);
    const user = this.user;
    if (isPresent(user)) {
      this.setup.perform(user);
    }
  },

  actions: {
    removeSelectedCohort(cohort){
      this.selectedCohorts.removeObject(cohort);
    },
    addSelectedCohort(cohort){
      this.selectedCohorts.pushObject(cohort);
    },
  },

  setup: task(function* (user) {
    this.set('finishedSetup', false);
    const store = this.store;
    const currentUser = this.currentUser;
    const permissionChecker = this.permissionChecker;

    const cohorts = yield user.get('cohorts');
    const selectedCohorts = cohorts.toArray();
    const primaryCohort = yield user.get('primaryCohort');

    const sessionUser = yield currentUser.get('model');
    const primarySchool = yield sessionUser.get('school');

    const allCohorts = yield store.findAll('cohort');
    const allSchools = yield store.findAll('school');
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

  save: task(function* () {
    const finishedSetup = this.finishedSetup;
    if (!finishedSetup) {
      return;
    }
    const user = this.user;
    const selectedCohorts = this.selectedCohorts;
    const primaryCohort = this.primaryCohort;

    user.set('primaryCohort', primaryCohort);

    const userCohorts = yield user.get('cohorts');
    userCohorts.clear();
    userCohorts.pushObjects(selectedCohorts);

    yield user.save();
    this.setIsManaging(false);
    this.set('hasSavedRecently', true);
    yield timeout(500);
    this.set('hasSavedRecently', false);
  }).drop()
});
