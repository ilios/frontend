import Ember from 'ember';
import DS from 'ember-data';
import EmberValidations from 'ember-validations';
const { inject, computed, RSVP, isEmpty, isPresent } = Ember;
const { service } = inject;
const { sort } = computed;
const { PromiseObject, PromiseArray } = DS;

export default Ember.Component.extend(EmberValidations, {
  store: service(),
  i18n: service(),
  currentUser: service(),
  ajax: service(),
  flashMessages: service(),
  iliosConfig: service(),

  init(){
    this._super(...arguments);
    this.set('showErrorsFor', []);
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

  showErrorsFor: [],
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

  validations: {
    'username': {
      presence: true,
      length: { maximum: 100 }
    },
    'password': {
      presence: {
        'if': 'allowCustomUserName'
      }
    },
    'otherId': {
      length: { maximum: 16 }
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
              this.set('isSaving', false);
              this.get('flashMessages').success('user.saved');
              this.attrs.transitionToUser(newUser.get('id'));
            });
          });
        });

      }).catch(() => {
        this.set('showErrorsFor', ['firstName', 'middleName', 'lastName', 'campusId', 'otherId', 'email', 'phone', 'username', 'password']);
        return;
      });

    },
    addErrorDisplayFor(field){
      this.get('showErrorsFor').pushObject(field);
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
    }
  }
});
