import Mixin from '@ember/object/mixin';
import { computed } from '@ember/object';
import { oneWay } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import RSVP from 'rsvp';
import ValidationErrorDisplay from 'ilios-common/mixins/validation-error-display';
import { task } from 'ember-concurrency';
import moment from 'moment';

const { filter } = RSVP;

export default Mixin.create(ValidationErrorDisplay, {
  store: service(),
  currentUser: service(),
  flashMessages: service(),
  permissionChecker: service(),

  init(){
    this._super(...arguments);
    this.loadCohorts.perform();
  },

  firstName: null,
  middleName: null,
  lastName: null,
  campusId: null,
  otherId: null,
  email: null,
  username: null,
  password: null,
  phone: null,
  schoolId: null,
  primaryCohortId: null,

  isSaving: false,
  nonStudentMode: true,

  schools: computed(async function(){
    const permissionChecker = this.permissionChecker;
    const store = this.store;
    const schools = await store.findAll('school', {reload: true});
    return filter(schools.toArray(), async school => {
      return permissionChecker.canCreateUser(school);
    });
  }),

  bestSelectedSchool: computed('schoolId', 'schools.[]', async function() {
    const schoolId = this.schoolId;
    const schools = await this.schools;

    if (schoolId) {
      const currentSchool = schools.findBy('id', schoolId);

      if (currentSchool) {
        return currentSchool;
      }
    }

    const user = await this.currentUser.model;
    return user.school;
  }),

  bestSelectedCohort: computed('bestSelectedSchool.cohorts.[]', 'primaryCohortId', async function() {
    const primaryCohortId = this.primaryCohortId;
    const school = await this.bestSelectedSchool;
    const cohorts = await school.cohorts;

    if (primaryCohortId) {
      const currentCohort = cohorts.findBy('id', primaryCohortId);

      if (currentCohort) {
        return currentCohort;
      }
    }

    return cohorts.lastObject;
  }),

  cohorts: oneWay('loadCohorts.lastSuccessful.value'),
  loadCohorts: task(function * () {
    const school = yield this.bestSelectedSchool;
    let cohorts = yield this.store.query('cohort', {
      filters: {
        schools: [school.get('id')],
      }
    });

    //prefetch programYears and programs so that ember data will coalesce these requests.
    const programYears = yield RSVP.all(cohorts.getEach('programYear'));
    yield RSVP.all(programYears.getEach('program'));

    cohorts = cohorts.toArray();
    const all = [];

    for(let i = 0; i < cohorts.length; i++){
      const cohort = cohorts[i];
      const obj = {
        id: cohort.get('id')
      };
      const programYear = yield cohort.get('programYear');
      const program = yield programYear.get('program');
      obj.title = program.get('title') + ' ' + cohort.get('title');
      obj.startYear = programYear.get('startYear');
      obj.duration = program.get('duration');

      all.pushObject(obj);
    }

    const lastYear = parseInt(moment().subtract(1, 'year').format('YYYY'), 10);
    return all.filter(obj=> {
      const finalYear = parseInt(obj.startYear, 10) + parseInt(obj.duration, 10);
      return finalYear > lastYear;
    });

  }).restartable(),

  save: task(function * (){
    this.send('addErrorDisplaysFor', ['firstName', 'middleName', 'lastName', 'campusId', 'otherId', 'email', 'phone', 'username', 'password']);
    const {validations} = yield this.validate();
    if (validations.get('isInvalid')) {
      return;
    }
    const {
      firstName,
      middleName,
      lastName,
      campusId,
      otherId,
      email,
      phone,
      username,
      password,
      store,
      nonStudentMode
    } = this;
    const roles = yield store.findAll('user-role');
    const school = yield this.bestSelectedSchool;
    const primaryCohort = yield this.bestSelectedCohort;
    let user = this.store.createRecord('user', {
      firstName,
      middleName,
      lastName,
      campusId,
      otherId,
      email,
      phone,
      school,
      enabled: true,
      root: false
    });
    if (!nonStudentMode) {
      user.set('primaryCohort', primaryCohort);
      const studentRole = roles.findBy('title', 'Student');
      user.set('roles', [studentRole]);
    }
    user = yield user.save();
    const authentication = this.store.createRecord('authentication', {
      user,
      username,
      password
    });
    yield authentication.save();
    this.flashMessages.success('general.saved');
    this.transitionToUser(user.get('id'));
    this.send('clearErrorDisplay');
  }).drop(),

  actions: {
    setSchool(id){
      this.set('schoolId', id);
      this.loadCohorts.perform();
    },
    setPrimaryCohort(id){
      this.set('primaryCohortId', id);
    }
  }
});
