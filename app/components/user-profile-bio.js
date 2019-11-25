import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import { all } from 'rsvp';
import { task, timeout } from 'ember-concurrency';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios-common/mixins/validation-error-display';

const Validations = buildValidations({
  firstName: [
    validator('presence', true),
    validator('length', {
      max: 50
    })
  ],
  middleName: [
    validator('length', {
      max: 20
    })
  ],
  lastName: [
    validator('presence', true),
    validator('length', {
      max: 50
    })
  ],
  campusId: [
    validator('length', {
      max: 16
    })
  ],
  otherId: [
    validator('length', {
      max: 16
    })
  ],
  email: [
    validator('presence', true),
    validator('length', {
      max: 100
    }),
    validator('format', {
      type: 'email'
    })
  ],
  displayName: [
    validator('length', {
      max: 200
    })
  ],
  preferredEmail: [
    validator('length', {
      max: 100
    }),
    validator('format', {
      allowBlank: true,
      type: 'email',
    })
  ],
  phone: [
    validator('length', {
      max: 20
    })
  ],
  username: {
    descriptionKey: 'general.username',
    validators: [
      validator('length', {
        max: 100,
      }),
      validator('format', {
        regex: /^[a-z0-9_\-()@.]*$/i,
      })
    ]
  },
  password: {
    dependentKeys: ['model.canEditUsernameAndPassword', 'model.changeUserPassword'],
    disabled: computed('model.canEditUsernameAndPassword', 'model.changeUserPassword', function() {
      return this.get('model.canEditUsernameAndPassword') && !this.get('model.changeUserPassword');
    }),
    validators: [
      validator('presence', true),
      validator('length', {
        min: 5
      })
    ]
  }
});

export default Component.extend(ValidationErrorDisplay, Validations, {
  currentUser: service(),
  iliosConfig: service(),
  fetch: service(),
  store: service(),

  classNameBindings: [':user-profile-bio', ':small-component', 'hasSavedRecently:has-saved:has-not-saved'],

  'data-test-user-profile-bio': true,

  campusId: null,
  changeUserPassword: false,
  email: null,
  displayName: null,
  firstName: null,
  hasSavedRecently: false,
  isManageable: false,
  isManaging: false,
  lastName: null,
  middleName: null,
  otherId: null,
  password: null,
  phone: null,
  preferredEmail: null,
  showSyncErrorMessage: false,
  updatedFieldsFromSync: null,
  user: null,
  username: null,

  canEditUsernameAndPassword: computed('iliosConfig.userSearchType', async function() {
    const userSearchType = await this.iliosConfig.userSearchType;
    return userSearchType !== 'ldap';
  }),

  passwordStrengthScore: computed('password', async function() {
    const { default: zxcvbn } = await import('zxcvbn');
    const password = isEmpty(this.password) ? '' : this.password;
    const obj = zxcvbn(password);
    return obj.score;
  }),

  usernameMissing: computed('user.authentication', async function() {
    const authentication = await this.user.authentication;
    return isEmpty(authentication) || isEmpty(authentication.username);
  }),

  init() {
    this._super(...arguments);
    this.set('updatedFieldsFromSync', []);
  },

  didReceiveAttrs() {
    this._super(...arguments);
    const user = this.user;
    const isManaging = this.isManaging;
    const manageTask = this.manage;
    if (user && isManaging && !manageTask.get('lastSuccessfull')){
      manageTask.perform();
    }
  },

  actions: {
    cancelChangeUserPassword() {
      this.set('changeUserPassword', false);
      this.set('password', null);
      this.send('removeErrorDisplayFor', 'password');
    }
  },

  keyUp(event) {
    const keyCode = event.keyCode;
    const target = event.target;

    if (! ['text', 'password'].includes(target.type)) {
      return;
    }

    if (13 === keyCode) {
      this.save.perform();
      return;
    }

    if (27 === keyCode) {
      if ('text' === target.type) {
        this.cancel.perform();
      } else {
        this.send('cancelChangeUserPassword');
      }
    }
  },

  manage: task(function* () {
    const user = this.user;
    this.setProperties(user.getProperties(
      'firstName',
      'middleName',
      'lastName',
      'campusId',
      'otherId',
      'email',
      'displayName',
      'preferredEmail',
      'phone'
    ));
    const auth = yield user.get('authentication');
    if (auth) {
      this.set('username', auth.get('username'));
      this.set('password', '');
    }

    this.setIsManaging(true);
    return true;
  }),

  save: task(function* () {
    yield timeout(10);
    const store = this.store;
    const canEditUsernameAndPassword = yield this.canEditUsernameAndPassword;
    const changeUserPassword = yield this.changeUserPassword;
    this.send('addErrorDisplaysFor', [
      'firstName',
      'middleName',
      'lastName',
      'campusId',
      'otherId',
      'email',
      'displayName',
      'preferredEmail',
      'phone',
      'username',
      'password'
    ]);
    const {validations} = yield this.validate();
    if (validations.get('isValid')) {
      const user = this.user;

      user.setProperties(this.getProperties(
        'firstName',
        'middleName',
        'lastName',
        'campusId',
        'otherId',
        'email',
        'displayName',
        'preferredEmail',
        'phone'
      ));
      let auth = yield user.get('authentication');
      if (!auth) {
        auth = store.createRecord('authentication', {
          user
        });
      }
      //always set and send the username in case it was updated in the sync
      let username = this.username;
      if (isEmpty(username)) {
        username = null;
      }
      auth.set('username', username);
      if (canEditUsernameAndPassword && changeUserPassword) {
        auth.set('password', this.password);
      }
      yield auth.save();
      yield user.save();
      const pendingUpdates = yield user.get('pendingUserUpdates');
      yield all(pendingUpdates.invoke('destroyRecord'));

      this.send('clearErrorDisplay');
      this.cancel.perform();
      this.set('hasSavedRecently', true);
      yield timeout(500);
      this.set('hasSavedRecently', false);
    }
  }).drop(),

  directorySync: task(function* () {
    yield timeout(10);
    this.set('updatedFieldsFromSync', []);
    this.set('showSyncErrorMessage', false);
    this.set('syncComplete', false);
    const userId = this.get('user.id');
    const url = `/application/directory/find/${userId}`;
    try {
      const data = yield this.fetch.getJsonFromApiHost(url);
      const userData = data.result;
      const firstName = this.firstName;
      const lastName = this.lastName;
      const displayName = this.displayName;
      const email = this.email;
      const username = this.username;
      const phone = this.phone;
      const campusId = this.campusId;
      if (userData.firstName !== firstName) {
        this.set('firstName', userData.firstName);
        this.updatedFieldsFromSync.pushObject('firstName');
      }
      if (userData.lastName !== lastName) {
        this.set('lastName', userData.lastName);
        this.updatedFieldsFromSync.pushObject('lastName');
      }
      if (userData.displayName !== displayName) {
        this.set('displayName', userData.displayName);
        this.updatedFieldsFromSync.pushObject('displayName');
      }
      if (userData.email !== email) {
        this.set('email', userData.email);
        this.updatedFieldsFromSync.pushObject('email');
      }

      if (userData.campusId !== campusId) {
        this.set('campusId', userData.campusId);
        this.updatedFieldsFromSync.pushObject('campusId');
      }
      if (userData.phone !== phone) {
        this.set('phone', userData.phone);
        this.updatedFieldsFromSync.pushObject('phone');
      }
      if (userData.username !== username) {
        this.set('username', userData.username);
        this.updatedFieldsFromSync.pushObject('username');
      }
    } catch (e) {
      this.set('showSyncErrorMessage', true);
    } finally {
      this.set('syncComplete', true);
      yield timeout(2000);
      this.set('syncComplete', false);
    }
  }).drop(),

  cancel: task(function* () {
    yield timeout(1);
    this.set('hasSavedRecently', false);
    this.set('updatedFieldsFromSync', []);
    this.setIsManaging(false);
    this.set('changeUserPassword', false);
    this.set('firstName', null);
    this.set('lastName', null);
    this.set('middleName', null);
    this.set('campusId', null);
    this.set('otherId', null);
    this.set('email', null);
    this.set('displayName', null);
    this.set('preferredEmail', null);
    this.set('phone', null);
    this.set('username', null);
    this.set('password', null);
  }).drop()
});
