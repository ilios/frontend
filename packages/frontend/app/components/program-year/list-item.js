import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import { service } from '@ember/service';
import { dropTask } from 'ember-concurrency';

export default class ProgramYearListItemComponent extends Component {
  @service permissionChecker;
  @service currentUser;

  @tracked showRemoveConfirmation = false;

  @cached
  get canLockData() {
    return new TrackedAsyncData(this.permissionChecker.canLockProgramYear(this.args.programYear));
  }

  @cached
  get canUnlockData() {
    return new TrackedAsyncData(this.permissionChecker.canUnlockProgramYear(this.args.programYear));
  }

  @cached
  get canDeleteData() {
    return new TrackedAsyncData(this.permissionChecker.canDeleteProgramYear(this.args.programYear));
  }

  @cached
  get programData() {
    return new TrackedAsyncData(this.args.programYear.program);
  }

  get program() {
    return this.programData.isResolved ? this.programData.value : null;
  }

  @cached
  get cohortData() {
    return new TrackedAsyncData(this.args.programYear.cohort);
  }

  get cohort() {
    return this.cohortData.isResolved ? this.cohortData.value : null;
  }

  get canLock() {
    return this.canLockData.isResolved ? this.canLockData.value : false;
  }

  get canUnlock() {
    return this.canUnlockData.isResolved ? this.canUnlockData.value : false;
  }

  get canDelete() {
    if (!this.cohort) {
      return false;
    }

    const cohortUsers = this.cohort.hasMany('users').ids();
    if (cohortUsers.length) {
      return false;
    }

    return this.canDeleteData.isResolved ? this.canDeleteData.value : false;
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
