import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { isEmpty, isPresent } from '@ember/utils';
import { filter } from 'rsvp';
import { dropTask, restartableTask } from 'ember-concurrency';
import { findBy, findById } from 'ilios-common/utils/array-helpers';
import { TrackedAsyncData } from 'ember-async-data';
import { DateTime } from 'luxon';
import YupValidations from 'ilios-common/classes/yup-validations';
import { string } from 'yup';

export default class NewDirectoryUserComponent extends Component {
  @service fetch;
  @service iliosConfig;
  @service intl;
  @service store;
  @service currentUser;
  @service flashMessages;
  @service permissionChecker;

  @tracked isSearching = false;
  @tracked searchResults = [];
  @tracked searchResultsReturned = false;
  @tracked selectedUser = false;
  @tracked tooManyResults = false;
  @tracked firstName;
  @tracked middleName;
  @tracked lastName;
  @tracked displayName;
  @tracked campusId;
  @tracked otherId;
  @tracked email;
  @tracked username;
  @tracked password;
  @tracked phone;
  @tracked schoolId = null;
  @tracked primaryCohortId = null;
  @tracked isSaving = false;
  @tracked nonStudentMode = true;

  userModel = new TrackedAsyncData(this.currentUser.getModel());
  authTypeConfig = new TrackedAsyncData(this.iliosConfig.getAuthenticationType());

  validations = new YupValidations(this, {
    otherId: string().nullable().max(16),
    username: string().when('$allowCustomUserName', {
      is: true,
      then: (schema) => schema.required().min(1).max(100),
      otherwise: (schema) => schema.notRequired(),
    }),
    password: string().when('$allowCustomUserName', {
      is: true,
      then: (schema) => schema.required(),
      otherwise: (schema) => schema.notRequired(),
    }),
  });

  constructor() {
    super(...arguments);
    if (this.args.searchTerms) {
      this.findUsersInDirectory.perform(this.args.searchTerms);
    }
  }

  @cached
  get allowCustomUserName() {
    if (!this.authTypeConfig.isResolved) {
      return false;
    }

    return this.authTypeConfig.value === 'form';
  }

  get allSchools() {
    return this.store.peekAll('school');
  }

  @cached
  get user() {
    return this.userModel.isResolved ? this.userModel.value : null;
  }

  @cached
  get schoolsWithCreatePermissions() {
    return new TrackedAsyncData(
      filter(this.allSchools, async (school) => {
        return this.permissionChecker.canCreateUser(school);
      }),
    );
  }

  @cached
  get schools() {
    return this.schoolsWithCreatePermissions.isResolved
      ? this.schoolsWithCreatePermissions.value
      : [];
  }

  get primarySchool() {
    return findById(this.allSchools, this.user.belongsTo('school').id());
  }

  @cached
  get currentSchoolCohorts() {
    const programIds = this.store
      .peekAll('program')
      .filter((program) => program.belongsTo('school').id() === this.bestSelectedSchool?.id)
      .map((program) => program.id);
    const programYearIds = this.store
      .peekAll('program-year')
      .filter((programYear) => programIds.includes(programYear.belongsTo('program').id()))
      .map((programYear) => programYear.id);

    return this.store
      .peekAll('cohort')
      .filter((cohort) => programYearIds.includes(cohort.belongsTo('programYear').id()));
  }

  @cached
  get cohorts() {
    const programYears = this.store.peekAll('program-year');
    const programs = this.store.peekAll('program');
    const objects = this.currentSchoolCohorts.map((cohort) => {
      const programYear = programYears.find((p) => p.id === cohort.belongsTo('programYear').id());
      const program = programs.find((p) => p.id === programYear.belongsTo('program').id());

      return {
        id: cohort.id,
        title: `${program.title} ${cohort.title}`,
        startYear: programYear.startYear,
        duration: program.duration,
      };
    });

    const lastYear = DateTime.now().year - 1;
    return objects.filter((obj) => {
      const finalYear = Number(obj.startYear) + Number(obj.duration);
      return finalYear > lastYear;
    });
  }

  get bestSelectedSchool() {
    if (this.schoolId) {
      const currentSchool = findById(this.schools, this.schoolId);

      if (currentSchool) {
        return currentSchool;
      }
    }

    if (this.schools.includes(this.primarySchool)) {
      return this.primarySchool;
    }

    return this.schools[0];
  }

  get bestSelectedCohort() {
    if (this.primaryCohortId) {
      const currentCohort = findById(this.currentSchoolCohorts, this.primaryCohortId);

      if (currentCohort) {
        return currentCohort;
      }
    }

    return this.currentSchoolCohorts.slice().reverse()[0];
  }

  @action
  pickUser(user) {
    this.selectedUser = true;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.displayName = user.displayName;
    this.email = user.email;
    this.campusId = user.campusId;
    this.phone = user.telephoneNumber;
    this.username = user.username;
  }

  @action
  unPickUser() {
    this.selectedUser = false;
    this.firstName = null;
    this.lastName = null;
    this.displayName = null;
    this.email = null;
    this.campusId = null;
    this.phone = null;
    this.username = null;
  }

  @action
  setSchool(id) {
    this.schoolId = id;
  }

  @action
  setPrimaryCohort(id) {
    this.primaryCohortId = id;
  }

  @action
  keyboard(event) {
    const keyCode = event.keyCode;
    const target = event.target;

    if ('text' === target.type) {
      if (13 === keyCode) {
        this.save.perform();
        return;
      }

      if (27 === keyCode) {
        this.args.close();
      }
      return;
    }

    if ('search' === target.type) {
      if (13 === keyCode) {
        this.findUsersInDirectory.perform(this.args.searchTerms);
        return;
      }

      if (27 === keyCode) {
        this.searchTerms = '';
      }
    }
  }

  findUsersInDirectory = restartableTask(async (searchTerms) => {
    this.searchResultsReturned = false;
    this.tooManyResults = false;
    if (!isEmpty(searchTerms)) {
      const url = '/application/directory/search?limit=51&searchTerms=' + searchTerms;
      const data = await this.fetch.getJsonFromApiHost(url);
      const mappedResults = data.results.map((result) => {
        result.addable =
          isPresent(result.firstName) &&
          isPresent(result.lastName) &&
          isPresent(result.email) &&
          isPresent(result.campusId);

        result.fullName = result.displayName.length
          ? result.displayName
          : `${result.firstName} ${result.lastName}`;
        return result;
      });
      this.tooManyResults = mappedResults.length > 50;
      this.searchResults = mappedResults;
      this.searchResultsReturned = true;
    }
  });

  save = dropTask(async () => {
    this.validations.addErrorDisplayForAllFields();
    const isValid = await this.validations.isValid();
    if (!isValid) {
      return false;
    }
    const roles = await this.store.findAll('user-role');
    const primaryCohort = this.bestSelectedCohort;
    let user = this.store.createRecord('user', {
      firstName: this.firstName,
      middleName: this.middleName,
      lastName: this.lastName,
      displayName: this.displayName,
      campusId: this.campusId,
      otherId: this.otherId,
      email: this.email,
      phone: this.phone,
      school: this.bestSelectedSchool,
      enabled: true,
      root: false,
    });
    if (!this.nonStudentMode) {
      user.set('primaryCohort', primaryCohort);
      const studentRole = findBy(roles, 'title', 'Student');
      user.set('roles', [studentRole]);
    }
    user = await user.save();
    const authentication = this.store.createRecord('authentication', {
      user,
      username: this.username,
      password: this.password,
    });
    await authentication.save();
    this.validations.clearErrorDisplay();
    this.flashMessages.success('general.saved');
    this.args.transitionToUser(user.id);
  });
}
