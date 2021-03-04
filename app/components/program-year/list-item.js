import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';
import AsyncProcess from 'ilios-common/classes/resolve-async-value';
import { use } from 'ember-could-get-used-to-this';
import { inject as service } from '@ember/service';
import { dropTask } from 'ember-concurrency';

export default class ProgramYearListItemComponent extends Component {
  @service permissionChecker;
  @service currentUser;

  @tracked showRemoveConfirmation = false;

  @use program = new ResolveAsyncValue(() => [this.args.programYear.program]);
  @use cohort = new ResolveAsyncValue(() => [this.args.programYear.cohort]);
  @use canDeletePermission = new AsyncProcess(() => [
    this.permissionChecker.canDeleteProgramYear,
    this.args.programYear,
  ]);
  @use canLock = new AsyncProcess(() => [
    this.permissionChecker.canLockProgramYear,
    this.args.programYear,
  ]);
  @use canUnlock = new AsyncProcess(() => [
    this.permissionChecker.canUnlockProgramYear,
    this.args.programYear,
  ]);

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
    const canUnlock = await this. permissionChecker.canUnlockProgramYear(programYear);

    const cohortUsers = cohort.hasMany('users').ids();
    if (cohortUsers.length === 0) {
      canDelete = await this.permissionChecker.canDeleteProgramYear(programYear);
    }

    return { canDelete, canLock, canUnlock };
  }

  @dropTask
  *lock() {
    this.args.programYear.set('locked', true);
    yield this.args.programYear.save();
  }

  @dropTask
  *unlock() {
    this.args.programYear.set('locked', false);
    yield this.args.programYear.save();
  }

  @dropTask
  *remove() {
    yield this.args.programYear.destroyRecord();
  }
}
