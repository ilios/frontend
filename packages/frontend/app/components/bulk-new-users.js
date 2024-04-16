import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { getOwner } from '@ember/application';
import { action } from '@ember/object';
import CoreObject from '@ember/object/core';
import { service } from '@ember/service';
import { isPresent } from '@ember/utils';
import { all, filter } from 'rsvp';
import { dropTask, restartableTask } from 'ember-concurrency';
import PapaParse from 'papaparse';
import { DateTime } from 'luxon';
import { validatable, Length, NotBlank, IsEmail, Custom } from 'ilios-common/decorators/validation';
import { findById, mapBy } from 'ilios-common/utils/array-helpers';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';

export default class BulkNewUsersComponent extends Component {
  @service flashMessages;
  @service iliosConfig;
  @service intl;
  @service store;
  @service currentUser;
  @service permissionChecker;
  @service dataLoader;

  @tracked file = null;
  @tracked fileUploadError = false;
  @tracked nonStudentMode = true;
  @tracked schoolId;
  @tracked primaryCohortId;
  @tracked proposedUsers = [];
  @tracked savedUserIds = [];
  @tracked savingAuthenticationErrors = [];
  @tracked savingUserErrors = [];
  @tracked selectedUsers = [];
  @tracked validUsers = [];

  userModel = new TrackedAsyncData(this.currentUser.getModel());
  get primarySchool() {
    return findById(this.schoolData.value, this.userModel.value.belongsTo('school').id());
  }

  @cached
  get schoolData() {
    return new TrackedAsyncData(this.dataLoader.loadSchoolsForLearnerGroups());
  }

  @cached
  get schoolsWithPermissionData() {
    return new TrackedAsyncData(
      filter(this.data.schools, async (school) => {
        return this.permissionChecker.canCreateUser(school);
      }),
    );
  }

  get isLoading() {
    return (
      this.userModel.isPending ||
      this.schoolData.isPending ||
      this.schoolsWithPermissionData.isPending
    );
  }

  @cached
  get data() {
    return {
      schools: this.store.peekAll('school'),
      programs: this.store.peekAll('program'),
      programYears: this.store.peekAll('programYear'),
      cohorts: this.store.peekAll('cohort'),
    };
  }

  @cached
  get programs() {
    return this.data.programs.filter(
      (program) => program.belongsTo('school').id() === this.bestSelectedSchool.id,
    );
  }

  @cached
  get programYears() {
    const programIds = this.programs.map(({ id }) => id);

    return this.data.programYears.filter((programYear) =>
      programIds.includes(programYear.belongsTo('program').id()),
    );
  }

  @cached
  get schoolCohorts() {
    const programYearIds = this.programYears.map(({ id }) => id);

    return this.data.cohorts.filter((cohort) =>
      programYearIds.includes(cohort.belongsTo('programYear').id()),
    );
  }

  get cohorts() {
    const cohortsWithData = this.schoolCohorts.map((cohort) => {
      const programYear = findById(this.data.programYears, cohort.belongsTo('programYear').id());
      const program = findById(this.data.programs, programYear.belongsTo('program').id());
      return {
        id: cohort.id,
        model: cohort,
        title: program.title + ' ' + cohort.title,
        startYear: Number(programYear.startYear),
        duration: Number(program.duration),
      };
    });

    const lastYear = DateTime.now().minus({ year: 1 }).year;
    return cohortsWithData.filter((obj) => {
      const finalYear = obj.startYear + obj.duration;
      return finalYear > lastYear;
    });
  }

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
      const currentSchool = findById(this.data.schools, this.schoolId);

      if (currentSchool) {
        return currentSchool;
      }
    }
    return this.primarySchool;
  }

  get bestSelectedCohort() {
    if (this.primaryCohortId) {
      const currentCohort = findById(this.data.cohorts, this.primaryCohortId);

      if (currentCohort) {
        return currentCohort;
      }
    }

    return this.cohorts.reverse()[0];
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
    return mapBy(authentications.slice(), 'username').filter(Boolean);
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
            String(obj.lastName).toLowerCase() !== 'last',
        );
        resolve(notHeaderRow);
      };

      PapaParse.parse(file, {
        complete,
      });
    });
  }

  updateSelectedFile = restartableTask(async (files) => {
    // Check for the various File API support.
    if (window.File && window.FileReader && window.FileList && window.Blob) {
      if (files.length > 0) {
        await this.parseFile.perform(files[0]);
      }
    } else {
      throw new Error(this.intl.t('general.unsupportedBrowserFailure'));
    }
  });

  setSchool = restartableTask(async (id) => {
    this.schoolId = id;
  });

  parseFile = restartableTask(async (file) => {
    const proposedUsers = await this.getFileContents(file);
    const existingUsernames = await this.existingUsernames();
    const filledOutUsers = proposedUsers.map((obj) => {
      obj.existingUsernames = existingUsernames;

      return obj;
    });
    this.validUsers = await filter(filledOutUsers, async (obj) => {
      return await obj.isValid();
    });

    this.selectedUsers = this.validUsers;
    this.proposedUsers = filledOutUsers;
  });

  save = dropTask(async () => {
    this.savedUserIds = [];
    const nonStudentMode = this.nonStudentMode;
    const selectedSchool = this.bestSelectedSchool;
    const selectedCohort = this.bestSelectedCohort;
    const roles = await this.store.findAll('user-role');
    const studentRole = findById(roles.slice(), '4');

    const proposedUsers = this.selectedUsers;

    const validUsers = await filter(proposedUsers, async (obj) => {
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
        user.set('primaryCohort', selectedCohort?.cohortModel);
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
        await all(users.map((user) => user.save()));
        const authentications = mapBy(parts, 'authentication');
        await all(authentications.map((auth) => auth.save()));
      } catch (e) {
        const userErrors = parts.filter((obj) => obj.user.get('isError'));
        const authenticationErrors = parts.filter(
          (obj) =>
            !userErrors.includes(obj) &&
            isPresent(obj.authentication) &&
            obj.authentication.get('isError'),
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

    this.validUsers = [];
    this.selectedUsers = [];
    this.proposedUsers = [];
  });
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
