import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { isEmpty, isPresent } from '@ember/utils';
import { all, filter } from 'rsvp';
import { dropTask, restartableTask } from 'ember-concurrency';
import moment from 'moment';
import { validatable, Length, NotBlank } from 'ilios-common/decorators/validation';
import { findBy, findById, mapBy } from 'ilios-common/utils/array-helpers';
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
      const currentSchool = findById(this.schools, this.schoolId);

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
      const currentCohort = findById(this.currentSchoolCohorts.slice(), this.primaryCohortId);

      if (currentCohort) {
        return currentCohort;
      }
    }

    return this.currentSchoolCohorts.slice().reverse()[0];
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
    const programYears = await all(mapBy(cohorts.slice(), 'programYear'));
    await all(mapBy(programYears.slice(), 'program'));

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

  load = restartableTask(async () => {
    const authType = await this.iliosConfig.getAuthenticationType();
    this.allowCustomUserName = 'form' === authType;
    const user = await this.currentUser.getModel();
    this.primarySchool = await user.school;
    this.schools = await this.loadSchools();
    this.cohorts = await this.loadCohorts(this.primarySchool);
    this.currentSchoolCohorts = await this.bestSelectedSchool?.cohorts;
    if (isPresent(this.args.searchTerms)) {
      await this.findUsersInDirectory.perform(this.args.searchTerms);
    }
  });

  reload = restartableTask(async () => {
    this.currentSchoolCohorts = await this.bestSelectedSchool?.cohorts;
    this.cohorts = await this.loadCohorts(this.bestSelectedSchool);
  });

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
        return result;
      });
      this.tooManyResults = mappedResults.length > 50;
      this.searchResults = mappedResults;
      this.searchResultsReturned = true;
    }
  });

  save = dropTask(async () => {
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
    const isValid = await this.isValid();
    if (!isValid) {
      return false;
    }
    const roles = await this.store.findAll('user-role');
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
      const studentRole = findBy(roles.slice(), 'title', 'Student');
      user.set('roles', [studentRole]);
    }
    user = await user.save();
    const authentication = this.store.createRecord('authentication', {
      user,
      username: this.username,
      password: this.password,
    });
    await authentication.save();
    this.clearErrorDisplay();
    this.flashMessages.success('general.saved');
    this.args.transitionToUser(user.id);
  });
}
