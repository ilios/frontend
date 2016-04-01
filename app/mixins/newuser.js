import Ember from 'ember';
import ValidationErrorDisplay from 'ilios/mixins/validation-error-display';

const { Mixin, inject, computed, RSVP } = Ember;
const { service } = inject;
const { Promise } = RSVP;


export default Mixin.create(ValidationErrorDisplay, {
  store: service(),
  currentUser: service(),
  flashMessages: service(),

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
            resolve(cohorts.get('firstObject'));
          });
        });
      });
    }
  }).readOnly(),

  actions: {
    save: function(){
      if(this.get('isSaving')){
        return;
      }
      this.set('isSaving', true);
      this.send('addErrorDisplaysFor', ['firstName', 'middleName', 'lastName', 'campusId', 'otherId', 'email', 'phone', 'username', 'password']);
      this.validate().then(({validations}) => {
        if (validations.get('isValid')) {
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
          store.findAll('user-role').then(roles => {
            this.get('bestSelectedSchool').then(school => {
              let user = this.get('store').createRecord('user', {
                firstName,
                middleName,
                lastName,
                campusId,
                otherId,
                email,
                phone,
                school,
                enabled: true
              });

              this.get('bestSelectedCohort').then(primaryCohort => {
                if (this.get('nonStudentMode')) {
                  let facultyRole = roles.findBy('id', '3');
                  user.set('roles', [facultyRole]);
                } else {
                  user.set('primaryCohort', primaryCohort);
                  let studentRole = roles.findBy('id', '4');
                  user.set('roles', [studentRole]);
                }
                user.save().then(newUser => {
                  let authentication = this.get('store').createRecord('authentication', {
                    user: newUser,
                    username,
                    password
                  });
                  return authentication.save().then(()=>{
                    this.get('flashMessages').success('user.saved');
                    this.attrs.transitionToUser(newUser.get('id'));
                  });
                }).finally(() => {
                  this.send('clearErrorDisplay');
                });
              });

            });
          });
        }
      }).finally(() => {
        this.set('isSaving', false);
      });
    },
    setSchool(id){
      this.set('schoolId', id);
    },
    setPrimaryCohort(id){
      this.set('primaryCohortId', id);
    },
    setNonStudentMode(value){
      this.set('nonStudentMode', value);
    }
  }
});
