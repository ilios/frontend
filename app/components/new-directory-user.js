import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { isEmpty, isPresent } from '@ember/utils';
import { all, filter } from 'rsvp';
import { dropTask, restartableTask } from 'ember-concurrency';
import moment from 'moment';
import { validatable, Length, NotBlank } from 'ilios-common/decorators/validation';
import { ValidateIf } from 'class-validator';

@validatable
export default class NewDirectoryUserComponent extends Component {
  @service fetch;
  @service iliosConfig;
  @service intl;
  @service store;
  @service currentUser;
  @service flashMessages;
  @service permissionChecker;

  @tracked allowCustomUserName = false;
  @tracked isSearching = false;
  @tracked searchResults = [];
  @tracked searchResultsReturned = false;
  @tracked selectedUser = false;
  @tracked tooManyResults = false;
  @tracked firstName;
  @tracked middleName;
  @tracked lastName;
  @tracked campusId;
  @tracked @Length(0, 16) otherId;
  @tracked email;
  @tracked @ValidateIf((o) => o.allowCustomUserName) @NotBlank() @Length(1, 100) username;
  @tracked @ValidateIf((o) => o.allowCustomUserName) @NotBlank() password;
  @tracked phone;
  @tracked schoolId = null;
  @tracked primaryCohortId = null;
  @tracked primarySchool = null;
  @tracked currentSchoolCohorts = [];
  @tracked cohorts = [];
  @tracked schools = [];
  @tracked isSaving = false;
  @tracked nonStudentMode = true;

  get isLoading() {
    return this.load.isRunning || this.reload.isRunning;
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
    if (!this.currentSchoolCohorts) {
      return null;
    }

    if (this.primaryCohortId) {
      const currentCohort = this.currentSchoolCohorts.findBy('id', this.primaryCohortId);

      if (currentCohort) {
        return currentCohort;
      }
    }

    return this.currentSchoolCohorts.lastObject;
  }

  async loadSchools() {
    const schools = await this.store.findAll('school');
    return filter(schools.slice(), async (school) => {
      return this.permissionChecker.canCreateUser(school);
    });
  }

  async loadCohorts(school) {
    if (!school) {
      return;
    }
    const cohorts = await this.store.query('cohort', {
      filters: {
        schools: [school.id],
      },
    });

    //prefetch programYears and programs so that ember data will coalesce these requests.
    const programYears = await all(cohorts.getEach('programYear'));
    await all(programYears.getEach('program'));

    const objects = await all(
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

  @restartableTask
  *load() {
    const authType = yield this.iliosConfig.getAuthenticationType();
    this.allowCustomUserName = 'form' === authType;
    const user = yield this.currentUser.getModel();
    this.primarySchool = yield user.school;
    this.schools = yield this.loadSchools();
    this.cohorts = yield this.loadCohorts(this.primarySchool);
    this.currentSchoolCohorts = yield this.bestSelectedSchool?.cohorts;
    if (isPresent(this.args.searchTerms)) {
      yield this.findUsersInDirectory.perform(this.args.searchTerms);
    }
  }

  @restartableTask
  *reload() {
    this.currentSchoolCohorts = yield this.bestSelectedSchool?.cohorts;
    this.cohorts = yield this.loadCohorts(this.bestSelectedSchool);
  }

  @action
  pickUser(user) {
    this.selectedUser = true;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
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

  @restartableTask
  *findUsersInDirectory(searchTerms) {
    this.searchResultsReturned = false;
    this.tooManyResults = false;
    if (!isEmpty(searchTerms)) {
      const url = '/application/directory/search?limit=51&searchTerms=' + searchTerms;
      const data = yield this.fetch.getJsonFromApiHost(url);
      const mappedResults = data.results.map((result) => {
        result.addable =
          isPresent(result.firstName) &&
          isPresent(result.lastName) &&
          isPresent(result.email) &&
          isPresent(result.campusId);
        return result;
      });
      this.tooManyResults = mappedResults.length > 50;
      this.searchResults = mappedResults;
      this.searchResultsReturned = true;
    }
  }

  @dropTask
  *save() {
    this.addErrorDisplaysFor([
      'firstName',
      'middleName',
      'lastName',
      'campusId',
      'otherId',
      'email',
      'phone',
      'username',
      'password',
    ]);
    const isValid = yield this.isValid();
    if (!isValid) {
      return false;
    }
    const roles = yield this.store.findAll('user-role');
    const primaryCohort = this.bestSelectedCohort;
    let user = this.store.createRecord('user', {
      firstName: this.firstName,
      middleName: this.middleName,
      lastName: this.lastName,
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
      const studentRole = roles.findBy('title', 'Student');
      user.set('roles', [studentRole]);
    }
    user = yield user.save();
    const authentication = this.store.createRecord('authentication', {
      user,
      username: this.username,
      password: this.password,
    });
    yield authentication.save();
    this.clearErrorDisplay();
    this.flashMessages.success('general.saved');
    this.args.transitionToUser(user.id);
  }
}
