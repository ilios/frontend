import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { all, filter } from 'rsvp';
import { dropTask, restartableTask } from 'ember-concurrency';
import moment from 'moment';
import { validatable, IsEmail, Length, NotBlank } from 'ilios-common/decorators/validation';
import { findBy, findById, mapBy } from 'ilios-common/utils/array-helpers';

@validatable
export default class NewUserComponent extends Component {
  @service store;
  @service currentUser;
  @service flashMessages;
  @service permissionChecker;

  @tracked @Length(1, 50) @NotBlank() firstName = null;
  @tracked @Length(1, 20) middleName = null;
  @tracked @Length(1, 50) @NotBlank() lastName = null;
  @tracked @Length(1, 16) campusId = null;
  @tracked @Length(1, 16) otherId = null;
  @tracked @IsEmail() @Length(1, 100) @NotBlank() email = null;
  @tracked @Length(1, 100) @NotBlank() username = null;
  @tracked @NotBlank() password = null;
  @tracked @Length(1, 20) phone = null;
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

  @restartableTask
  *load() {
    const user = yield this.currentUser.getModel();
    this.primarySchool = yield user.school;
    this.schools = yield this.loadSchools();
    this.currentSchoolCohorts = yield this.bestSelectedSchool?.cohorts;
    this.cohorts = yield this.loadCohorts(this.bestSelectedSchool);
  }

  @restartableTask
  *reload() {
    this.currentSchoolCohorts = yield this.bestSelectedSchool?.cohorts;
    this.cohorts = yield this.loadCohorts(this.bestSelectedSchool);
  }

  async loadSchools() {
    const store = this.store;
    const schools = await store.findAll('school');
    return await filter(schools.slice(), async (school) => {
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
      const studentRole = findBy(roles.slice(), 'title', 'Student');
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
    this.args.transitionToUser(user.get('id'));
  }

  @dropTask
  *saveOrCancel(event) {
    const keyCode = event.keyCode;
    if (13 === keyCode) {
      yield this.save.perform();
    } else if (27 === keyCode) {
      this.args.close();
    }
  }
}
