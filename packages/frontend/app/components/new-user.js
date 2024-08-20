import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { filter } from 'rsvp';
import { dropTask } from 'ember-concurrency';
import { validatable, IsEmail, Length, NotBlank } from 'ilios-common/decorators/validation';
import { findBy, findById } from 'ilios-common/utils/array-helpers';
import { TrackedAsyncData } from 'ember-async-data';
import { DateTime } from 'luxon';

@validatable
export default class NewUserComponent extends Component {
  @service intl;
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
  @tracked
  @Length(1, 100)
  @NotBlank()
  username = null;
  @tracked @NotBlank() password = null;
  @tracked @Length(1, 20) phone = null;
  @tracked schoolId = null;
  @tracked primaryCohortId = null;
  @tracked isSaving = false;
  @tracked nonStudentMode = true;
  @tracked showUsernameTakenErrorMessage = false;

  userModel = new TrackedAsyncData(this.currentUser.getModel());
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

    return this.currentSchoolCohorts.reverse()[0];
  }

  async isUsernameTaken(username) {
    const auths = await this.store.query('authentication', {
      filters: { username },
    });
    return !!auths.length;
  }

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
    const isUsernameTaken = await this.isUsernameTaken(this.username);
    if (isUsernameTaken) {
      this.clearErrorDisplay();
      this.showUsernameTakenErrorMessage = true;
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
    this.clearErrorDisplay();
    this.flashMessages.success('general.saved');
    this.args.transitionToUser(user.get('id'));
  });

  saveOrCancel = dropTask(async (event) => {
    const keyCode = event.keyCode;
    if (13 === keyCode) {
      await this.save.perform();
    } else if (27 === keyCode) {
      this.args.close();
    }
  });
}
