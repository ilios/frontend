import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { getOwner } from '@ember/application';
import { action } from '@ember/object';
import CoreObject from '@ember/object/core';
import { inject as service } from '@ember/service';
import { isPresent } from '@ember/utils';
import { all, filter } from 'rsvp';
import { dropTask, restartableTask } from 'ember-concurrency';
import PapaParse from 'papaparse';
import moment from 'moment';
import { validatable, Length, NotBlank, IsEmail, Custom } from 'ilios-common/decorators/validation';
import { findById, mapBy } from 'ilios-common/utils/array-helpers';

export default class BulkNewUsersComponent extends Component {
  @service flashMessages;
  @service iliosConfig;
  @service intl;
  @service store;
  @service currentUser;
  @service permissionChecker;

  @tracked file = null;
  @tracked fileUploadError = false;
  @tracked nonStudentMode = true;
  @tracked primarySchool = null;
  @tracked schoolId;
  @tracked primaryCohortId;
  @tracked cohorts = [];
  @tracked schools = [];
  @tracked proposedUsers = [];
  @tracked savedUserIds = [];
  @tracked savingAuthenticationErrors = [];
  @tracked savingUserErrors = [];
  @tracked selectedUsers = [];

  get sampleData() {
    const sampleUploadFields = [
      'First',
      'Last',
      'Middle',
      'Phone',
      'Email',
      'CampusID',
      'OtherID',
      'Username',
      'Password',
    ];
    const str = sampleUploadFields.join('\t');
    return window.btoa(str);
  }

  get bestSelectedSchool() {
    if (this.schoolId) {
      const currentSchool = findById(this.schools, this.schoolId);

      if (currentSchool) {
        return currentSchool;
      }
    }
    return this.primarySchool;
  }

  get bestSelectedCohort() {
    if (this.primaryCohortId) {
      const currentCohort = findById(this.cohorts, this.primaryCohortId);

      if (currentCohort) {
        return currentCohort;
      }
    }

    return this.cohorts.slice().reverse()[0];
  }

  @restartableTask
  *load() {
    const user = yield this.currentUser.getModel();
    this.primarySchool = yield user.school;
    this.schools = yield this.loadSchools.perform();
    this.cohorts = yield this.loadCohorts.perform(this.bestSelectedSchool);
  }

  @action
  toggleUserSelection(obj) {
    if (this.selectedUsers.includes(obj)) {
      this.selectedUsers = this.selectedUsers.filter((user) => user !== obj);
    } else {
      this.selectedUsers.push(obj);
    }
  }

  @action
  setPrimaryCohort(id) {
    this.primaryCohortId = id;
  }

  async existingUsernames() {
    const authentications = await this.store.findAll('authentication');
    return mapBy(authentications.slice(), 'username');
  }

  /**
   * Extract the contents of a file into an array of user like objects
   * @param {Object} file
   *
   * @return array
   **/
  async getFileContents(file) {
    this.fileUploadError = false;
    return new Promise((resolve) => {
      const allowedFileTypes = ['text/plain', 'text/csv', 'text/tab-separated-values'];
      if (!allowedFileTypes.includes(file.type)) {
        const intl = this.intl;
        this.set('fileUploadError', true);
        throw new Error(intl.t('general.fileTypeError', { fileType: file.type }));
      }
      const complete = ({ data }) => {
        const proposedUsers = data.map((arr) => {
          return ProposedUser.create(getOwner(this).ownerInjection(), {
            firstName: isPresent(arr[0]) ? arr[0] : null,
            lastName: isPresent(arr[1]) ? arr[1] : null,
            middleName: isPresent(arr[2]) ? arr[2] : null,
            phone: isPresent(arr[3]) ? arr[3] : null,
            email: isPresent(arr[4]) ? arr[4] : null,
            campusId: isPresent(arr[5]) ? arr[5] : null,
            otherId: isPresent(arr[6]) ? arr[6] : null,
            username: isPresent(arr[7]) ? arr[7] : null,
            password: isPresent(arr[8]) ? arr[8] : null,
          });
        });
        const notHeaderRow = proposedUsers.filter(
          (obj) =>
            String(obj.firstName).toLowerCase() !== 'first' ||
            String(obj.lastName).toLowerCase() !== 'last'
        );
        resolve(notHeaderRow);
      };

      PapaParse.parse(file, {
        complete,
      });
    });
  }

  @restartableTask
  *updateSelectedFile(files) {
    // Check for the various File API support.
    if (window.File && window.FileReader && window.FileList && window.Blob) {
      if (files.length > 0) {
        yield this.parseFile.perform(files[0]);
      }
    } else {
      throw new Error(this.intl.t('general.unsupportedBrowserFailure'));
    }
  }

  @restartableTask
  *setSchool(id) {
    this.schoolId = id;
    this.cohorts = yield this.loadCohorts.perform(this.bestSelectedSchool);
  }

  @restartableTask
  *parseFile(file) {
    const proposedUsers = yield this.getFileContents(file);
    const existingUsernames = yield this.existingUsernames();
    const filledOutUsers = proposedUsers.map((obj) => {
      obj.existingUsernames = existingUsernames;

      return obj;
    });
    const validUsers = yield filter(filledOutUsers, async (obj) => {
      return await obj.isValid();
    });

    this.selectedUsers = validUsers;
    this.proposedUsers = filledOutUsers;
  }

  @dropTask
  *save() {
    this.savedUserIds = [];
    const nonStudentMode = this.nonStudentMode;
    const selectedSchool = this.bestSelectedSchool;
    const selectedCohort = this.bestSelectedCohort;
    const roles = yield this.store.findAll('user-role');
    const studentRole = findById(roles.slice(), '4');

    const proposedUsers = this.selectedUsers;

    const validUsers = yield filter(proposedUsers, async (obj) => {
      return obj.isValid();
    });

    const records = validUsers.map((userInput) => {
      const {
        firstName,
        lastName,
        middleName,
        phone,
        email,
        campusId,
        otherId,
        addedViaIlios,
        enabled,
        username,
        password,
      } = userInput;
      const user = this.store.createRecord('user', {
        firstName,
        lastName,
        middleName,
        phone,
        email,
        campusId,
        otherId,
        addedViaIlios,
        enabled,
      });
      user.set('school', selectedSchool);

      if (!nonStudentMode) {
        user.set('primaryCohort', selectedCohort);
        user.set('roles', [studentRole]);
      }

      let authentication = false;
      if (userInput.username) {
        authentication = this.store.createRecord('authentication', { username, password });
        authentication.set('user', user);
      }

      const rhett = { user, userInput };
      if (authentication) {
        rhett.authentication = authentication;
      }

      return rhett;
    });
    let parts;
    while (records.length > 0) {
      try {
        parts = records.splice(0, 10);
        const users = mapBy(parts, 'user');
        yield all(users.map((user) => user.save()));
        const authentications = mapBy(parts, 'authentication');
        yield all(authentications.map((auth) => auth.save()));
      } catch (e) {
        const userErrors = parts.filter((obj) => obj.user.get('isError'));
        const authenticationErrors = parts.filter(
          (obj) =>
            !userErrors.includes(obj) &&
            isPresent(obj.authentication) &&
            obj.authentication.get('isError')
        );
        this.savingUserErrors = [...this.savingUserErrors, ...userErrors];
        this.savingAuthenticationErrors = [
          ...this.savingAuthenticationErrors,
          ...authenticationErrors,
        ];
      } finally {
        this.savedUserIds = [...this.savedUserIds, ...mapBy(mapBy(parts, 'user'), 'id')];
      }
    }

    if (this.savingUserErrors.length || this.savingAuthenticationErrors.length) {
      this.flashMessages.warning('general.newUsersCreatedWarning');
    } else {
      this.flashMessages.success('general.newUsersCreatedSuccessfully');
    }

    this.selectedUsers = [];
    this.proposedUsers = [];
  }

  @restartableTask
  *loadSchools() {
    const schools = yield this.store.findAll('school', { reload: true });
    return filter(schools.slice(), async (school) => {
      return this.permissionChecker.canCreateUser(school);
    });
  }

  @restartableTask
  *loadCohorts(school) {
    const cohorts = yield this.store.query('cohort', {
      filters: {
        schools: [school.id],
      },
    });

    //prefetch programYears and programs so that ember data will coalesce these requests.
    const programYears = yield all(mapBy(cohorts.slice(), 'programYear'));
    yield all(mapBy(programYears.slice(), 'program'));

    const objects = yield all(
      cohorts.slice().map(async (cohort) => {
        const obj = {
          id: cohort.get('id'),
        };
        const programYear = await cohort.programYear;
        const program = await programYear.program;
        obj.title = program.title + ' ' + cohort.title;
        obj.startYear = programYear.startYear;
        obj.duration = program.duration;

        return obj;
      })
    );

    const lastYear = parseInt(moment().subtract(1, 'year').format('YYYY'), 10);
    return objects.filter((obj) => {
      const finalYear = parseInt(obj.startYear, 10) + parseInt(obj.duration, 10);
      return finalYear > lastYear;
    });
  }
}

@validatable
class ProposedUser extends CoreObject {
  @service intl;

  @Length(1, 50) @NotBlank() firstName;
  @Length(1, 20) middleName;
  @Length(1, 50) @NotBlank() lastName;
  @Length(1, 100) @Custom('validateUsernameCallback', 'validateUsernameMessageCallback') username;
  @Custom('validatePasswordCallback', 'validatePasswordMessageCallback') password;
  @Length(1, 16) campusId;
  @Length(1, 16) otherId;
  @Length(1, 100) @NotBlank() @IsEmail() email;
  @Length(1, 20) phone;
  addedViaIlios = true;
  enabled = true;

  constructor(data) {
    super(...arguments);
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.middleName = data.middleName;
    this.phone = data.phone;
    this.email = data.email;
    this.campusId = data.campusId;
    this.otherId = data.otherId;
    this.username = data.username;
    this.password = data.password;
    this.addErrorDisplayForAllFields();
  }

  async validateUsernameCallback() {
    return !this.existingUsernames.includes(this.username);
  }

  validateUsernameMessageCallback() {
    return this.intl.t('errors.exclusion', { description: this.intl.t('general.username') });
  }

  async validatePasswordCallback() {
    if (!this.username) {
      return true;
    }
    const stringValue = String(this.password).trim();
    return Boolean(stringValue.length);
  }

  validatePasswordMessageCallback() {
    return this.intl.t('errors.blank', { description: this.intl.t('general.password') });
  }
}
