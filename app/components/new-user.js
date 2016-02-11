import Ember from 'ember';
import DS from 'ember-data';
import EmberValidations, { validator as emberValidator } from 'ember-validations';
import validator from 'npm:validator';
const { inject, computed, RSVP } = Ember;
const { service } = inject;
const { oneWay, sort } = computed;
const { PromiseObject } = DS;

export default Ember.Component.extend(EmberValidations, {
  store: service(),
  i18n: service(),
  currentUser: service(),

  flashMessages: service(),

  init(){
    this._super(...arguments);

    //for testing
    this.set('firstName', 'Jon');
    this.set('lastName', 'Johnson');
    this.set('campusId', '1234');
    this.set('email', 'j@example.com');


    this.set('showErrorsFor', []);
  },

  firstName: null,
  middleName: null,
  lastName: null,
  campusId: null,
  otherId: null,
  email: null,
  phone: null,
  schoolId: null,

  showErrorsFor: [],
  isSaving: false,

  sortBy: ['title'],
  sortedSchools: sort('schools', 'sortBy'),
  schools: oneWay('currentUser.model.schools'),

  validations: {
    'firstName': {
      presence: true,
      length: { maximum: 20 }
    },
    'middleName': {
      length: { maximum: 20 }
    },
    'lastName': {
      presence: true,
      length: { maximum: 30 }
    },
    'campusId': {
      length: { maximum: 16 }
    },
    'otherId': {
      length: { maximum: 16 }
    },
    'email': {
      presence: true,
      length: { maximum: 100 },
      inline: emberValidator(function() {
        const email = this.model.get('email');
        if (!validator.isEmail(email)) {
          return this.model.get('i18n').t('errors.email');
        }
      }),
    },
    'phone': {
      length: { maximum: 20 }
    },
  },

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
    save(){
      if(this.get('isSaving')){
        return;
      }
      this.validate().then(()=>{
        this.set('isSaving', true);
        const { firstName, middleName, lastName, campusId, otherId, email, phone } = this.getProperties('firstName', 'middleName', 'lastName', 'campusId', 'otherId', 'email', 'phone');
        this.get('bestSelectedSchool').then(school => {
          let user = this.get('store').createRecord('user', {
            firstName,
            middleName,
            lastName,
            campusId,
            email,
            school,
          });
          user.save().then(newUser => {
            this.set('isSaving', false);
            this.get('flashMessages').success('user.saved');
            this.attrs.transitionToUser(newUser.get('id'));
          });
        });

      }).catch(() => {
        this.set('showErrorsFor', ['firstName', 'middleName', 'lastName', 'campusId', 'otherId', 'email', 'phone']);
        return;
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
