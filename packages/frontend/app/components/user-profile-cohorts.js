import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { dropTask, timeout, restartableTask } from 'ember-concurrency';
import { TrackedAsyncData } from 'ember-async-data';

export default class UserProfileCohortsComponent extends Component {
  @service currentUser;
  @service permissionChecker;
  @service store;

  @tracked hasSavedRecently = false;
  @tracked primaryCohortBuffer = null;
  @tracked secondaryCohortsBuffer = [];

  @cached
  get primaryCohortData() {
    return new TrackedAsyncData(this.args.user.primaryCohort);
  }

  get primaryCohort() {
    return this.primaryCohortData.isResolved ? this.primaryCohortData.value : null;
  }

  @cached
  get cohortsData() {
    return new TrackedAsyncData(this.args.user.cohorts);
  }

  get secondaryCohorts() {
    if (!this.cohortsData.isResolved || !this.primaryCohortData.isResolved) {
      return [];
    }

    const primaryCohort = this.primaryCohortData.value;
    const cohorts = this.cohortsData.value;

    if (!primaryCohort) {
      return cohorts;
    }
    return cohorts.filter((cohort) => {
      return cohort.id !== this.primaryCohort.id;
    });
  }

  @action
  addSecondaryCohortToBuffer(cohort) {
    this.secondaryCohortsBuffer = [...this.secondaryCohortsBuffer, cohort];
  }

  @action
  removeSecondaryCohortFromBuffer(cohort) {
    this.secondaryCohortsBuffer = this.secondaryCohortsBuffer.filter((c) => c !== cohort);
  }

  @action
  setPrimaryCohortBuffer(cohort) {
    this.primaryCohortBuffer = cohort;
  }

  load = restartableTask(async () => {
    const primaryCohort = await this.args.user.primaryCohort;
    const cohorts = (await this.args.user.cohorts).slice();
    this.primaryCohortBuffer = primaryCohort;
    this.secondaryCohortsBuffer = cohorts;
    this.primaryCohortBuffer = primaryCohort;
  });

  cancel = restartableTask(async () => {
    const primaryCohort = await this.args.user.primaryCohort;
    const cohorts = (await this.args.user.cohorts).slice();
    this.primaryCohortBuffer = primaryCohort;
    this.secondaryCohortsBuffer = cohorts;
    this.args.setIsManaging(false);
  });

  save = dropTask(async () => {
    this.args.user.primaryCohort = this.primaryCohortBuffer;
    this.args.user.cohorts = this.secondaryCohortsBuffer;
    await this.args.user.save();
    this.args.setIsManaging(false);
    this.hasSavedRecently = true;
    await timeout(500);
    this.hasSavedRecently = false;
  });
}
