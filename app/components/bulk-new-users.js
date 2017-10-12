import { inject as service } from '@ember/service';
import Component from '@ember/component';
import RSVP from 'rsvp';
import { isPresent } from '@ember/utils';
import EmberObject, { computed } from '@ember/object';
import { getOwner } from '@ember/application';
import { task } from 'ember-concurrency';
import { validator, buildValidations } from 'ember-cp-validations';
import NewUser from 'ilios/mixins/newuser';
import PapaParse from 'papaparse';

const { Promise, filter } = RSVP;
const { reads, not } = computed;

const UserValidations = buildValidations({
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
    validator('length', {
      max: 100,
      min: 1,
      ignoreBlank: true,
    }),
    validator('exclusion', {
      dependentKeys: ['model.existingUsernames.[]'],
      in: reads('model.existingUsernames')
    })
  ],
  password: [
    validator('presence', {
      presence: true,
      dependentKeys: ['model.username'],
      disabled: not('model.username'),
    })
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

export default Component.extend(NewUser, {
  init(){
    this._super(...arguments);
    this.set('selectedUsers', []);
    this.set('proposedUsers', []);
    this.set('savedUserIds', []);
    this.set('savingUserErrors', []);
    this.set('savingAuthenticationErrors', []);
  },
  i18n: service(),
  flashMessages: service(),
  iliosConfig: service(),

  classNames: ['bulk-new-users'],
  file: null,
  selectedUsers: null,
  proposedUsers: null,
  savedUserIds: null,
  savingUserErrors: null,
  savingAuthenticationErrors: null,
  fileUploadError: false,
  host: reads('iliosConfig.apiHost'),
  namespace: reads('iliosConfig.apiNameSpace'),

  existingUsernames(){
    const store = this.get('store');
    return new Promise(resolve => {
      store.query('authentication').then(authentications => {
        resolve(authentications.mapBy('username'));
      });
    });
  },

  /**
   * Extract the contents of a file into an array of user like objects
   * @param Object file
   *
   * @return array
   **/
  getFileContents(file){
    this.set('fileUploadError', false);
    return new Promise(resolve => {
      let allowedFileTypes = ['text/plain', 'text/csv', 'text/tab-separated-values'];
      if (!allowedFileTypes.includes(file.type)) {
        const i18n = this.get('i18n');
        this.set('fileUploadError', true);
        throw new Error(i18n.t('general.fileTypeError', {fileType: file.type}));
      }

      let ProposedUser = EmberObject.extend(getOwner(this).ownerInjection(), UserValidations, {
        email: null
      });
      let complete = ({data}) => {
        let proposedUsers = data.map(arr => {
          return ProposedUser.create({
            firstName: isPresent(arr[0])?arr[0]:null,
            lastName: isPresent(arr[1])?arr[1]:null,
            middleName: isPresent(arr[2])?arr[2]:null,
            phone: isPresent(arr[3])?arr[3]:null,
            email: isPresent(arr[4])?arr[4]:null,
            campusId: isPresent(arr[5])?arr[5]:null,
            otherId: isPresent(arr[6])?arr[6]:null,
            username: isPresent(arr[7])?arr[7]:null,
            password: isPresent(arr[8])?arr[8]:null
          });
        });
        let notHeaderRow = proposedUsers.filter(obj => String(obj.firstName).toLowerCase() !== 'first' || String(obj.lastName).toLowerCase() !== 'last');


        resolve(notHeaderRow);
      };

      PapaParse.parse(file, {
        complete
      });
    });
  },
  parseFile: task(function * (file) {
    let proposedUsers = yield this.getFileContents(file);
    let existingUsernames = yield this.existingUsernames();
    let filledOutUsers = proposedUsers.map(obj => {
      obj.addedViaIlios = true;
      obj.enabled = true;
      obj.existingUsernames = existingUsernames;

      return obj;
    });
    let validUsers = yield filter(filledOutUsers, obj => {
      return obj.validate().then(({validations}) => {
        return validations.get('isValid');
      });
    });

    this.set('selectedUsers', validUsers);
    this.set('proposedUsers', filledOutUsers);
  }).restartable(),

  save: task(function * () {
    this.set('savedUserIds', []);
    const store = this.get('store');
    const selectedSchool = yield this.get('bestSelectedSchool');
    const selectedCohort = yield this.get('bestSelectedCohort');
    const roles = yield store.findAll('user-role');
    const facultyRole = roles.findBy('id', '3');
    const studentRole = roles.findBy('id', '4');

    let proposedUsers = this.get('selectedUsers');

    let validUsers = yield filter(proposedUsers, obj => {
      return obj.validate().then(({validations}) => {
        return validations.get('isValid');
      });
    });
    let records = validUsers.map(userInput => {
      let user = store.createRecord('user', userInput.getProperties(
        'firstName',
        'lastName',
        'middleName',
        'phone',
        'email',
        'campusId',
        'otherId',
        'addedViaIlios',
        'enabled'
      ));
      user.set('school', selectedSchool);

      if (this.get('nonStudentMode')) {
        user.set('roles', [facultyRole]);
      } else {
        user.set('primaryCohort', selectedCohort);
        user.set('roles', [studentRole]);
      }

      let authentication = false;
      if (isPresent(userInput.get('username'))) {
        authentication = store.createRecord('authentication', userInput.getProperties(
          'username',
          'password'
        ));
        authentication.set('user', user);
      }

      let rhett =  {user, userInput};
      if (authentication) {
        rhett.authentication = authentication;
      }

      return rhett;
    });
    let parts;
    while (records.get('length') > 0){
      try {
        parts = records.splice(0, 10);
        let users = parts.mapBy('user');
        yield RSVP.all(users.invoke('save'));
        let authentications = parts.mapBy('authentication');
        yield RSVP.all(authentications.invoke('save'));
      } catch (e) {
        let userErrors = parts.filter(obj => obj.user.get('isError'));
        let authenticationErrors = parts.filter(obj => !userErrors.includes(obj) && isPresent(obj.authentication) && obj.authentication.get('isError'));
        this.get('savingUserErrors').pushObjects(userErrors);
        this.get('savingAuthenticationErrors').pushObjects(authenticationErrors);
      } finally {
        this.get('savedUserIds').pushObjects(parts.mapBy('user').mapBy('id'));
      }

    }

    const flashMessages = this.get('flashMessages');
    if (this.get('savingUserErrors').get('length') || this.get('savingAuthenticationErrors').get('length')) {
      flashMessages.warning('general.newUsersCreatedWarning');
    } else {
      flashMessages.success('general.newUsersCreatedSuccessfully');
    }

    this.set('selectedUsers', []);
    this.set('proposedUsers', []);

  }).drop(),
  sampleData: computed(function(){
    const sampleUploadFields = ['First', 'Last', 'Middle', 'Phone', 'Email', 'CampusID', 'OtherID', 'Username', 'Password'];

    const str = sampleUploadFields.join("\t");
    const encoded = window.btoa(str);

    return encoded;
  }),
  actions: {
    updateSelectedFile(files){
      // Check for the various File API support.
      if (window.File && window.FileReader && window.FileList && window.Blob) {
        if (files.length > 0) {
          this.get('parseFile').perform(files[0]);
        }
      } else {
        const i18n = this.get('i18n');
        throw new Error(i18n.t('general.unsupportedBrowserFailure'));
      }
    },
    toggleUserSelection(obj){
      let selectedUsers = this.get('selectedUsers');
      if (selectedUsers.includes(obj)) {
        selectedUsers.removeObject(obj);
      } else {
        selectedUsers.pushObject(obj);
      }
    },
  }
});
