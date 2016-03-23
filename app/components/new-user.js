import Ember from 'ember';
import DS from 'ember-data';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios/mixins/validation-error-display';

const { inject, computed, RSVP } = Ember;
const { service } = inject;
const { sort } = computed;
const { PromiseObject, PromiseArray } = DS;

const Validations = buildValidations({
  firstName: [
    validator('presence', true),
    validator('length', {
      max: 20
    }),
  ],
  middleName: [
    validator('length', {
      max: 20
    }),
  ],
  lastName: [
    validator('presence', true),
    validator('length', {
      max: 20
    }),
  ],
  username: [
    validator('presence', true),
    validator('length', {
      max: 100
    }),
  ],
  password: [
    validator('presence', true)
  ],
  campusId: [
    validator('length', {
      max: 16
    }),
  ],
  otherId: [
    validator('length', {
      max: 16
    }),
  ],
  email: [
    validator('presence', true),
    validator('length', {
      max: 100
    }),
    validator('format', {
      type: 'email'
    }),
  ],
  phone: [
    validator('length', {
      max: 20
    }),
  ]
});

export default Ember.Component.extend(ValidationErrorDisplay, Validations, {
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

  isSaving: false,

  sortBy: ['title'],
  sortedSchools: sort('schools', 'sortBy'),
  schools: computed('currentUser.model.schools.[]', {
    get(){
      let defer = RSVP.defer();
      this.get('currentUser.model').then(user => {
        user.get('schools').then(schools => {
          defer.resolve(schools);
        });
      });

      return PromiseArray.create({
        promise: defer.promise
      })
    }
  }).readOnly(),

  bestSelectedSchool: computed('schools.[]', 'schoolId', function(){
    let defer = RSVP.defer();
    const schoolId = this.get('schoolId');
    this.get('schools').then(schools => {
      if (schoolId) {
        let currentSchool = schools.find(school => {
          return school.get('id') === schoolId;
        });
        if (currentSchool) {
          defer.resolve(currentSchool);
          return;
        }
      }
      this.get('currentUser.model').then(user => {
        defer.resolve(user.get('school'));
      });
    });

    return PromiseObject.create({
      promise: defer.promise
    });
  }),
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
            password
          } = this.getProperties('firstName', 'middleName', 'lastName', 'campusId', 'otherId', 'email', 'phone', 'username', 'password');
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
              this.set('isSaving', false);
              this.send('clearErrorDisplay');
            });
          });
        }
      });
    },
    addErrorDisplayFor(field){
      this.get('showErrorsFor').pushObject(field);
    },
    setSchool(schoolId){
      this.set('schoolId', schoolId);
    }
  }
});
