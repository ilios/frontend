import Ember from 'ember';
import { task } from 'ember-concurrency';
import ValidationErrorDisplay from 'ilios/mixins/validation-error-display';
import moment from 'moment';

const { Mixin, inject, computed, RSVP } = Ember;
const { service } = inject;
const { Promise } = RSVP;
const { oneWay } = computed;


export default Mixin.create(ValidationErrorDisplay, {
  store: service(),
  currentUser: service(),
  flashMessages: service(),

  init(){
    this._super(...arguments);
    this.get('loadCohorts').perform();
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

  schools: computed('currentUser.model.schools.[]', {
    get(){
      return new Promise(resolve => {
        this.get('currentUser.model').then(user => {
          resolve(user.get('schools'));
        });
      });
    }
  }).readOnly(),

  bestSelectedSchool: computed('schools.[]', 'schoolId', {
    get(){
      return new Promise(resolve => {
        const schoolId = this.get('schoolId');
        this.get('schools').then(schools => {
          if (schoolId) {
            let currentSchool = schools.find(school => {
              return school.get('id') === schoolId;
            });
            if (currentSchool) {
              resolve(currentSchool);
              return;
            }
          }
          this.get('currentUser.model').then(user => {
            resolve(user.get('school'));
          });
        });
      });
    }
  }).readOnly(),

  bestSelectedCohort: computed('bestSelectedSchool.cohorts.[]', 'primaryCohortId', {
    get(){
      return new Promise(resolve => {
        const primaryCohortId = this.get('primaryCohortId');
        this.get('bestSelectedSchool').then(school => {
          school.get('cohorts').then(cohorts => {
            if (primaryCohortId) {
              let currentCohort = cohorts.find(cohort => cohort.get('id') === primaryCohortId);
              if (currentCohort) {
                resolve(currentCohort);
                return;
              }
            }
            resolve(cohorts.get('lastObject'));
          });
        });
      });
    }
  }).readOnly(),

  cohorts: oneWay('loadCohorts.lastSuccessful.value'),
  loadCohorts: task(function * () {
    let school = yield this.get('bestSelectedSchool');
    let cohorts = yield this.get('store').query('cohort', {
      filters: {
        schools: [school.get('id')],
      },
      limit: 1000,
    });

    //prefetch programYears and programs so that ember data will coalesce these requests.
    let programYears = yield RSVP.all(cohorts.getEach('programYear'));
    yield RSVP.all(programYears.getEach('program'));

    cohorts = cohorts.toArray();
    let all = [];

    for(let i = 0; i < cohorts.length; i++){
      let cohort = cohorts[i];
      let obj = {
        id: cohort.get('id')
      };
      let programYear = yield cohort.get('programYear');
      let program = yield programYear.get('program');
      obj.title = program.get('title') + ' ' + cohort.get('title');
      obj.startYear = programYear.get('startYear');
      obj.duration = program.get('duration');

      all.pushObject(obj);
    }

    let lastYear = parseInt(moment().subtract(1, 'year').format('YYYY'));
    return all.filter(obj=> {
      let finalYear = parseInt(obj.startYear) + parseInt(obj.duration);
      return finalYear > lastYear;
    });

  }).restartable(),

  save: task(function * (){
    this.send('addErrorDisplaysFor', ['firstName', 'middleName', 'lastName', 'campusId', 'otherId', 'email', 'phone', 'username', 'password']);
    let {validations} = yield this.validate();
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
      store
    } = this.getProperties('firstName', 'middleName', 'lastName', 'campusId', 'otherId', 'email', 'phone', 'username', 'password', 'store');
    const roles = yield store.findAll('user-role');
    const school = yield this.get('bestSelectedSchool');
    const primaryCohort = yield this.get('bestSelectedCohort');
    let user = this.get('store').createRecord('user', {
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
    if (this.get('nonStudentMode')) {
      let facultyRole = roles.findBy('title', 'Faculty');
      user.set('roles', [facultyRole]);
    } else {
      user.set('primaryCohort', primaryCohort);
      let studentRole = roles.findBy('title', 'Student');
      user.set('roles', [studentRole]);
    }
    user = yield user.save();
    let authentication = this.get('store').createRecord('authentication', {
      user,
      username,
      password
    });
    yield authentication.save();
    this.get('flashMessages').success('general.saved');
    this.get('transitionToUser')(user.get('id'));
    this.send('clearErrorDisplay');
  }).drop(),

  actions: {
    setSchool(id){
      this.set('schoolId', id);
      this.get('loadCohorts').perform();
    },
    setPrimaryCohort(id){
      this.set('primaryCohortId', id);
    },
    setNonStudentMode(value){
      this.set('nonStudentMode', value);
    }
  }
});
