import Ember from 'ember';
import { task, timeout } from 'ember-concurrency';
import { validator, buildValidations } from 'ember-cp-validations';
import NewUser from 'ilios/mixins/newuser';
import PapaParse from 'papaparse';

const { Component, RSVP, inject, isPresent, computed } = Ember;
const { service } = inject;
const { Promise } = RSVP;
const { reads } = computed;

const Validations = buildValidations({
  schoolId: [
    validator('presence', true),
  ],
});

export default Component.extend(NewUser, Validations, {
  init(){
    this._super(...arguments);
    this.set('selectedUsers', []);
    this.set('proposedUsers', []);
  },
  i18n: service(),
  ajax: service(),
  flashMessages: service(),
  serverVariables: service(),

  classNames: ['bulk-new-users'],
  file: null,
  selectedUsers: null,
  proposedUsers: null,
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
      let complete = ({data}) => {
        let proposedUsers = data.map(arr => {
          return {
            firstName: isPresent(arr[0])?arr[0]:null,
            lastName: isPresent(arr[1])?arr[1]:null,
            middleName: isPresent(arr[2])?arr[2]:null,
            phone: isPresent(arr[3])?arr[3]:null,
            email: isPresent(arr[4])?arr[4]:null,
            campusId: isPresent(arr[5])?arr[5]:null,
            otherId: isPresent(arr[6])?arr[6]:null,
            username: isPresent(arr[7])?arr[7]:null,
            password: isPresent(arr[8])?arr[8]:null
          };
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
    this.get('selectedUsers').pushObjects(filledOutUsers);
    this.get('proposedUsers').pushObjects(filledOutUsers);
  }).restartable(),

  save: task(function * () {
    yield timeout(10); //timeout to allow spinner to render
    const selectedSchool = yield this.get('bestSelectedSchool');

    let proposedUsers = this.get('selectedUsers');
    proposedUsers.setEach('school', selectedSchool.get('id'));
    let cleanUsers = proposedUsers.map(obj => {
      delete obj.username;
      delete obj.password;

      return obj;
    })

    const ajax = this.get('ajax');

    let response = yield ajax.request(this.get('namespace') + '/users', {
      method: 'POST',
      data: {
        users: cleanUsers
      }
    });

    let newUsers = response.users;
    if (newUsers.length === proposedUsers.length) {
      this.get('flashMessages').success('user.newUsersCreatedSuccessfully')
    } else {
      this.get('flashMessages').success('user.newUsersCreatedWarning')
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
