import Ember from 'ember';
import DS from 'ember-data';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios/mixins/validation-error-display';

const { inject, computed, RSVP, isEmpty, isPresent } = Ember;
const { service } = inject;
const { sort } = computed;
const { PromiseObject, PromiseArray } = DS;

const Validations = buildValidations({
  username: [
    validator('presence', {
      presence: true,
      dependentKeys: 'allowCustomUserName.content',
      disabled(){
        return !this.get('model.allowCustomUserName.content');
      }
    }),
    validator('length', {
      max: 100
    }),
  ],
  password: [
    validator('presence', true)
  ],
  otherId: [
    validator('length', {
      max: 16
    }),
  ],
});

export default Ember.Component.extend(Validations, ValidationErrorDisplay, {
  store: service(),
  i18n: service(),
  currentUser: service(),
  ajax: service(),
  flashMessages: service(),
  iliosConfig: service(),

  init(){
    this._super(...arguments);
    this.set('searchResults', []);
    if (isPresent(this.get('searchTerms'))) {
      this.send('findUsersInDirectory');
    }
  },
  classNames: ['new-directory-user'],

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

  searchResults: [],
  isSaving: false,
  selectedUser: false,
  isSearching: false,
  searchResultsReturned: false,
  tooManyResults: false,
  searchTerms: null,

  allowCustomUserName: computed('iliosConfig.authenticationType', function(){
    return PromiseObject.create({
      promise: this.get('iliosConfig.authenticationType').then(type => {
        return type === 'form';
      })
    });
  }),

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
    save(){
      this.send('addErrorDisplayFor', 'username');
      this.send('addErrorDisplayFor', 'password');
      this.send('addErrorDisplayFor', 'otherId');
      if(this.get('isSaving')){
        return;
      }
      this.validate().then(({validations}) => {
        if (validations.get('isValid')) {
          this.set('isSaving', true);
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
              authentication.save().then(()=>{
                this.send('clearErrorDisplay');
                this.set('isSaving', false);
                this.get('flashMessages').success('user.saved');
                this.attrs.transitionToUser(newUser.get('id'));
              });
            });
          });
        }
      });
    },
    setSchool(schoolId){
      this.set('schoolId', schoolId);
    },
    findUsersInDirectory(){
      let searchTerms = this.get('searchTerms');
      this.set('searchResultsReturned', false);
      this.set('tooManyResults', false);
      if (!isEmpty(searchTerms)) {
        this.set('isSearching', true);
        var url = '/application/directory/search?limit=51&searchTerms=' + searchTerms;
        const ajax = this.get('ajax');
        ajax.request(url).then(data => {
          let mappedResults = data.results.map(result => {
            result.addable = isPresent(result.firstName) && isPresent(result.lastName) && isPresent(result.email) && isPresent(result.campusId);
            return result;
          });
          this.set('tooManyResults', mappedResults.length > 50);
          this.set('searchResults', mappedResults);
          this.set('isSearching', false);
          this.set('searchResultsReturned', true);
        });
      }
    },
    pickUser(user){
      this.set('selectedUser', true);
      this.set('firstName', user.firstName);
      this.set('lastName', user.lastName);
      this.set('email', user.email);
      this.set('campusId', user.campusId);
      this.set('phone', user.telephoneNumber);
      this.set('username', user.username);
    },
    unPickUser(){
      this.set('selectedUser', false);
      this.set('firstName', null);
      this.set('lastName', null);
      this.set('email', null);
      this.set('campusId', null);
      this.set('phone', null);
      this.set('username', null);
    }
  }
});
