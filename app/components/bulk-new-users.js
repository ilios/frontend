import Ember from 'ember';
import { task } from 'ember-concurrency';
import { validator, buildValidations } from 'ember-cp-validations';
import NewUser from 'ilios/mixins/newuser';
import PapaParse from 'papaparse';

const { Component, RSVP, inject, isPresent, computed, getOwner } = Ember;
const { service } = inject;
const { Promise, filter } = RSVP;
const { reads } = computed;

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

export default Component.extend(NewUser, {
  init(){
    this._super(...arguments);
    this.set('selectedUsers', []);
    this.set('proposedUsers', []);
    this.set('savedUserIds', []);
  },
  i18n: service(),
  ajax: service(),
  flashMessages: service(),
  serverVariables: service(),

  classNames: ['bulk-new-users'],
  file: null,
  selectedUsers: null,
  proposedUsers: null,
  savedUserIds: null,
  host: reads('serverVariables.apiHost'),
  namespace: reads('serverVariables.apiNameSpace'),

  /**
   * Extract the contents of a file into an array of user like objects
   * @param Object file
   *
   * @return array
   **/
  getFileContents(file){
    return new Promise(resolve => {
      let ProposedUser = Ember.Object.extend(getOwner(this).ownerInjection(), UserValidations, {
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

        resolve(proposedUsers);
      };

      PapaParse.parse(file, {
        complete
      });
    });
  },
  parseFile: task(function * (file) {
    let proposedUsers = yield this.getFileContents(file);
    let filledOutUsers = proposedUsers.map(obj => {
      obj.addedViaIlios = true;
      obj.enabled = true;

      return obj;
    });
    let validUsers = yield filter(filledOutUsers, obj => {
      return obj.validate().then(({validations}) => {
        return validations.get('isValid');
      });
    });

    this.get('selectedUsers').pushObjects(validUsers);
    this.get('proposedUsers').pushObjects(filledOutUsers);
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
    let records = validUsers.map(obj => {
      let user = store.createRecord('user', obj.getProperties(
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

      let authentication = store.createRecord('authentication', obj.getProperties(
        'username',
        'password'
      ));
      authentication.set('user', user);

      return {user, authentication};
    });

    while (records.get('length') > 0){
      let parts = records.splice(0, 5);
      let users = parts.mapBy('user');
      yield RSVP.all(users.invoke('save'));
      let authentications = parts.mapBy('authentication');
      yield RSVP.all(authentications.invoke('save'));
      this.get('savedUserIds').pushObjects(users.mapBy('id'));
    }

    this.set('selectedUsers', []);
    this.set('proposedUsers', []);

  }).drop(),
  actions: {
    updateSelectedFile(files){
      if (files.length > 0) {
        this.get('parseFile').perform(files[0]);
      }
    },
    toggleUserSelection(obj){
      let selectedUsers = this.get('selectedUsers');
      if (selectedUsers.contains(obj)) {
        selectedUsers.removeObject(obj);
      } else {
        selectedUsers.pushObject(obj);
      }
    }
  }
});
