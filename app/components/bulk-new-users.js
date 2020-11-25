import Component from '@glimmer/component';
import {tracked} from '@glimmer/tracking';
import {getOwner} from '@ember/application';
import EmberObject, {action} from '@ember/object';
import {not, reads} from '@ember/object/computed';
import {inject as service} from '@ember/service';
import {isPresent} from '@ember/utils';
import {all, filter} from 'rsvp';
import {dropTask, restartableTask} from 'ember-concurrency-decorators';
import PapaParse from 'papaparse';
import moment from "moment";
import {buildValidations, validator} from 'ember-cp-validations';

const UserValidations = buildValidations({
  firstName: [
    validator('presence', true),
    validator('length', {
      max: 50
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
      max: 50
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

export default class BulkNewUsersComponent extends Component {
  @service flashMessages;
  @service iliosConfig;
  @service intl;
  @service store;
  @service currentUser;
  @service permissionChecker;

  @tracked file = null;
  @tracked fileUploadError = false;
  @tracked nonStudentMode = false;
  @tracked primarySchool = null;
  @tracked cohorts = [];
  @tracked schools = [];
  @tracked proposedUsers = [];
  @tracked savedUserIds = [];
  @tracked savingAuthenticationErrors = [];
  @tracked savingUserErrors = [];
  @tracked selectedUsers = [];

  get sampleData(){
    const sampleUploadFields = ['First', 'Last', 'Middle', 'Phone', 'Email', 'CampusID', 'OtherID', 'Username', 'Password'];
    const str = sampleUploadFields.join("\t");
    return window.btoa(str);
  }

  get bestSelectedSchool() {
    if (this.schoolId) {
      const currentSchool = this.schools.findBy('id', this.schoolId);

      if (currentSchool) {
        return currentSchool;
      }
    }
    return this.primarySchool;
  }

  get bestSelectedCohort() {
    if (this.primaryCohortId) {
      const currentCohort = this.cohorts.findBy('id', this.primaryCohortId);

      if (currentCohort) {
        return currentCohort;
      }
    }

    return this.cohorts.lastObject;
  }

  @restartableTask
  *load(){
    const user = yield this.currentUser.model;
    this.primarySchool = yield user.school;
    this.schools = yield this.loadSchools.perform();
    this.cohorts = yield this.loadCohorts.perform(this.bestSelectedSchool);
  }

  @action
  toggleUserSelection(obj){
    if (this.selectedUsers.includes(obj)) {
      this.selectedUsers.removeObject(obj);
    } else {
      this.selectedUsers.pushObject(obj);
    }
  }

  @action
  setPrimaryCohort(id){
    this.primaryCohortId = id;
  }


  async existingUsernames() {
    const authentications = await this.store.findAll('authentication');
    return authentications.mapBy('username');
  }

  /**
   * Extract the contents of a file into an array of user like objects
   * @param {Object} file
   *
   * @return array
   **/
  async getFileContents(file){
    this.set('fileUploadError', false);
    const allowedFileTypes = ['text/plain', 'text/csv', 'text/tab-separated-values'];
    if (!allowedFileTypes.includes(file.type)) {
      const intl = this.intl;
      this.set('fileUploadError', true);
      throw new Error(intl.t('general.fileTypeError', {fileType: file.type}));
    }

    const ProposedUser = EmberObject.extend(UserValidations, {
      email: null
    });

    await PapaParse.parse(file, async data => {
      const proposedUsers = data.map(arr => {
        return ProposedUser.create(getOwner(this).ownerInjection(), {
          firstName: isPresent(arr[0]) ? arr[0] : null,
          lastName: isPresent(arr[1]) ? arr[1] : null,
          middleName: isPresent(arr[2]) ? arr[2] : null,
          phone: isPresent(arr[3]) ? arr[3] : null,
          email: isPresent(arr[4]) ? arr[4] : null,
          campusId: isPresent(arr[5]) ? arr[5] : null,
          otherId: isPresent(arr[6]) ? arr[6] : null,
          username: isPresent(arr[7]) ? arr[7] : null,
          password: isPresent(arr[8]) ? arr[8] : null
        });
      });
      return proposedUsers.filter(obj => String(obj.firstName).toLowerCase() !== 'first' || String(obj.lastName).toLowerCase() !== 'last');
    });
  }

  @restartableTask
  *updateSelectedFile(files){
    // Check for the various File API support.
    if (window.File && window.FileReader && window.FileList && window.Blob) {
      if (files.length > 0) {
        yield this.parseFile.perform(files[0]);
      }
    } else {
      const intl = this.intl;
      throw new Error(intl.t('general.unsupportedBrowserFailure'));
    }
  }

  @restartableTask
  *setSchool(id){
    this.schoolId = id;
    this.cohorts = yield this.loadCohorts.perform(this.bestSelectedSchool);
  }

  @restartableTask
  *parseFile(file) {
    const proposedUsers = yield this.getFileContents(file);
    const existingUsernames = yield this.existingUsernames();
    this.proposedUsers = proposedUsers.map(obj => {
      obj.addedViaIlios = true;
      obj.enabled = true;
      obj.existingUsernames = existingUsernames;

      return obj;
    });
    this.selectedUsers = yield filter(this.proposedUsers, async obj => {
      const validations = await obj.validate();
      return validations.get('isValid');
    });
  }

  @dropTask
  *save() {
    this.savedUserIds = [];
    const store = this.store;
    const nonStudentMode = this.nonStudentMode;
    const selectedSchool = this.bestSelectedSchool;
    const selectedCohort = this.bestSelectedCohort;
    const roles = yield store.findAll('user-role');
    const studentRole = roles.findBy('id', '4');

    const proposedUsers = this.selectedUsers;

    const validUsers = yield filter(proposedUsers, async obj => {
      const validations = await obj.validate();
      return validations.get('isValid');
    });

    const records = validUsers.map(userInput => {
      const user = store.createRecord('user', userInput.getProperties(
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

      if (!nonStudentMode) {
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

      const rhett =  {user, userInput};
      if (authentication) {
        rhett.authentication = authentication;
      }

      return rhett;
    });
    let parts;
    while (records.get('length') > 0){
      try {
        parts = records.splice(0, 10);
        const users = parts.mapBy('user');
        yield all(users.invoke('save'));
        const authentications = parts.mapBy('authentication');
        yield all(authentications.invoke('save'));
      } catch (e) {
        const userErrors = parts.filter(obj => obj.user.get('isError'));
        const authenticationErrors = parts.filter(obj => !userErrors.includes(obj) && isPresent(obj.authentication) && obj.authentication.get('isError'));
        this.savingUserErrors.pushObjects(userErrors);
        this.savingAuthenticationErrors.pushObjects(authenticationErrors);
      } finally {
        this.savedUserIds.pushObjects(parts.mapBy('user').mapBy('id'));
      }

    }

    if (this.savingUserErrors.get('length') || this.savingAuthenticationErrors.get('length')) {
      this.flashMessages.warning('general.newUsersCreatedWarning');
    } else {
      this.flashMessages.success('general.newUsersCreatedSuccessfully');
    }

    this.selectedUsers = [];
    this.proposedUsers = [];

  }

  @restartableTask
  *loadSchools() {
    const store = this.store;
    const schools = yield store.findAll('school', { reload: true });
    return filter(schools.toArray(), async school => {
      return this.permissionChecker.canCreateUser(school);
    });
  }

  @restartableTask
  *loadCohorts(school) {
    const cohorts = yield this.store.query('cohort', {
      filters: {
        schools: [ school.id ],
      }
    });

    //prefetch programYears and programs so that ember data will coalesce these requests.
    const programYears = yield all(cohorts.getEach('programYear'));
    yield all(programYears.getEach('program'));

    const objects = yield all(cohorts.toArray().map(async cohort => {
      const obj = {
        id: cohort.get('id')
      };
      const programYear = await cohort.programYear;
      const program = await programYear.program;
      obj.title = program.title + ' ' + cohort.title;
      obj.startYear = programYear.startYear;
      obj.duration = program.duration;

      return obj;
    }));

    const lastYear = parseInt(moment().subtract(1, 'year').format('YYYY'), 10);
    return objects.filter(obj => {
      const finalYear = parseInt(obj.startYear, 10) + parseInt(obj.duration, 10);
      return finalYear > lastYear;
    });
  }
}
