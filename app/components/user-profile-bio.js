
import Ember from 'ember';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios/mixins/validation-error-display';
import { task, timeout } from 'ember-concurrency';
import strength from 'password-strength';

const { Component, inject, computed, isPresent, isEmpty } = Ember;
const { service } = inject;

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
  ],
  username: {
    dependentKeys: ['canEditUsernameAndPassword'],
    disabled(){
      return this.get('model.canEditUsernameAndPassword');
    },
    validators: [
      validator('presence', true),
      validator('length', {
        max: 100
      }),
    ]
  },
  password: {
    dependentKeys: ['canEditUsernameAndPassword', 'changeUserPassword'],
    disabled(){
      return this.get('model.canEditUsernameAndPassword') && !this.get('model.changeUserPassword');
    },
    validators: [
      validator('presence', true),
      validator('length', {
        min: 5
      }),
    ]
  },
});

export default Component.extend(ValidationErrorDisplay, Validations, {
  store: service(),
  currentUser: service(),
  iliosConfig: service(),
  ajax: service(),
  flashMessages: service(),

  init(){
    this._super(...arguments);
    this.set('updatedFieldsFromSync', []);
  },

  didReceiveAttrs(){
    this._super(...arguments);
    const user = this.get('user');
    if (isPresent(user)) {
      this.get('setup').perform(user);
    }
  },

  classNameBindings: [':user-profile-bio', ':small-component', 'hasSavedRecently:has-saved:has-not-saved'],

  user: null,
  isManaging: false,
  isManagable: false,
  firstName: null,
  middleName: null,
  lastName: null,
  campusId: null,
  otherId: null,
  email: null,
  phone: null,
  username: null,
  password: '',
  hasSavedRecently: false,
  changeUserPassword: false,
  updatedFieldsFromSync: null,

  setup: task(function * (user){
    this.set('finishedSetup', false);
    this.setProperties(user.getProperties(
      'firstName',
      'middleName',
      'lastName',
      'campusId',
      'otherId',
      'email',
      'phone'
    ));

    let canEditUsernameAndPassword = yield this.get('canEditUsernameAndPassword');
    if (canEditUsernameAndPassword) {
      const store = this.get('store');
      let auth = yield store.find('authentication', user.get('id'));
      this.set('username', auth.get('username'));
      this.set('password', '');
    }

    this.set('finishedSetup', true);
  }),

  save: task(function * (){
    yield timeout(10);
    this.send('addErrorDisplaysFor', ['firstName', 'middleName', 'lastName', 'campusId', 'otherId', 'email', 'phone', 'username', 'password']);
    let {validations} = yield this.validate();
    if (validations.get('isValid')) {
      const user = this.get('user');
      user.setProperties(this.getProperties(
        'firstName',
        'middleName',
        'lastName',
        'campusId',
        'otherId',
        'email',
        'phone'
      ));

      yield user.save();

      const canEditUsernameAndPassword = yield this.get('canEditUsernameAndPassword');
      const changeUserPassword = yield this.get('changeUserPassword');
      if (canEditUsernameAndPassword) {
        const store = this.get('store');
        let auth = yield store.find('authentication', user.get('id'));
        auth.set('username', this.get('username'));
        if (changeUserPassword) {
          auth.set('password', this.get('password'));
        }
        yield auth.save();
      }

      this.send('clearErrorDisplay');
      this.get('setIsManaging')(false);
      this.send('cancelChangeUserPassword');
      this.set('hasSavedRecently', true);
      yield timeout(500);
      this.set('hasSavedRecently', false);
    }

  }).drop(),

  directorySync: task(function * (){
    yield timeout(10);
    this.set('updatedFieldsFromSync', []);
    const userId = this.get('user.id');
    let url = `/application/directory/find/${userId}`;
    const ajax = this.get('ajax');
    try {
      let data = yield ajax.request(url);
      let userData = data.result;
      const firstName = this.get('firstName');
      const lastName = this.get('lastName');
      const email = this.get('email');
      const username = this.get('username');
      const phone = this.get('phone');
      const campusId = this.get('campusId');
      if (userData.firstName !== firstName) {
        this.set('firstName', userData.firstName);
        this.get('updatedFieldsFromSync').pushObject('firstName');
      }
      if (userData.lastName !== lastName) {
        this.set('lastName', userData.lastName);
        this.get('updatedFieldsFromSync').pushObject('lastName');
      }
      if (userData.email !== email) {
        this.set('email', userData.email);
        this.get('updatedFieldsFromSync').pushObject('email');
      }
      if (userData.campusId !== campusId) {
        this.set('campusId', userData.campusId);
        this.get('updatedFieldsFromSync').pushObject('campusId');
      }
      if (userData.phone !== phone) {
        this.set('phone', userData.phone);
        this.get('updatedFieldsFromSync').pushObject('phone');
      }
      if (userData.username !== username) {
        this.set('username', userData.username);
        this.get('updatedFieldsFromSync').pushObject('username');
      }
    } catch (e) {
      const flashMessages = this.get('flashMessages');
      flashMessages.alert('general.unableToSyncUser');
    }

  }).drop(),

  canEditUsernameAndPassword: computed('iliosConfig.userSearchType', function(){
    return new Promise(resolve => {
      this.get('iliosConfig.userSearchType').then(userSearchType => {
        resolve(userSearchType !== 'ldap');
      });
    });
  }),

  canSyncFromDirectory: computed('iliosConfig.userSearchType', function(){
    return new Promise(resolve => {
      this.get('iliosConfig.userSearchType').then(userSearchType => {
        resolve(userSearchType === 'ldap');
      });
    });
  }),

  passwordStrength: computed('password', function () {
    const password = isEmpty(this.get('password'))?'':this.get('password');
    return strength(password);
  }),

  actions: {
    cancelChangeUserPassword(){
      this.set('changeUserPassword', false);
      this.set('password', null);
      this.send('removeErrorDisplayFor', 'password');
    },
    cancel(){
      this.set('hasSavedRecently', false);
      this.set('updatedFieldsFromSync', []);
      this.get('setIsManaging')(false);
    }
  }
});
