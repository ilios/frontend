import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';
import PermissionChecker from 'ilios/classes/permission-checker';
import { use } from 'ember-could-get-used-to-this';
import { inject as service } from '@ember/service';
import { dropTask } from 'ember-concurrency';

export default class ProgramYearListItemComponent extends Component {
  @service permissionChecker;
  @service currentUser;

  @tracked showRemoveConfirmation = false;

  @use program = new ResolveAsyncValue(() => [this.args.programYear.program]);
  @use cohort = new ResolveAsyncValue(() => [this.args.programYear.cohort]);
  @use canDeletePermission = new PermissionChecker(() => [
    'canDeleteProgramYear',
    this.args.programYear,
  ]);
  @use canLock = new PermissionChecker(() => ['canLockProgramYear', this.args.programYear]);
  @use canUnlock = new PermissionChecker(() => ['canUnlockProgramYear', this.args.programYear]);

  get canDelete() {
    if (!this.cohort) {
      return false;
    }

    const cohortUsers = this.cohort.hasMany('users').ids();
    if (cohortUsers.length) {
      return false;
    }

    return this.canDeletePermission;
  }

  get classOfYear() {
    if (!this.program) {
      return '';
    }

    return Number(this.args.programYear.startYear) + Number(this.program.duration);
  }

  get academicYear() {
    if (this.args.academicYearCrossesCalendarYearBoundaries) {
      const endYear = Number(this.args.programYear.startYear) + 1;
      return `${this.args.programYear.startYear} - ${endYear}`;
    }

    return this.args.programYear.startYear;
  }

  async checkerPermissions(programYear, program, cohort) {
    let canDelete = false;
    const canLock = await this.permissionChecker.canLockProgramYear(programYear);
    const canUnlock = await this.permissionChecker.canUnlockProgramYear(programYear);

    const cohortUsers = cohort.hasMany('users').ids();
    if (cohortUsers.length === 0) {
      canDelete = await this.permissionChecker.canDeleteProgramYear(programYear);
    }

    return { canDelete, canLock, canUnlock };
  }

  lock = dropTask(async () => {
    this.args.programYear.set('locked', true);
    await this.args.programYear.save();
  });

  unlock = dropTask(async () => {
    this.args.programYear.set('locked', false);
    await this.args.programYear.save();
  });

  remove = dropTask(async () => {
    await this.args.programYear.destroyRecord();
  });
}
