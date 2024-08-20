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
  @tracked newPrimaryCohort = false;
  @tracked cohortsToAdd = [];
  @tracked cohortsToRemove = [];
  @tracked selectedSchool = null;

  @cached
  get allSchoolsData() {
    return new TrackedAsyncData(this.store.findAll('school'));
  }

  @cached
  get schoolPermissionsData() {
    return new TrackedAsyncData(
      Promise.all(
        this.allSchoolsData.value.map(async (school) => {
          return {
            school,
            canUpdate: await this.permissionChecker.canUpdateUserInSchool(school),
          };
        }),
      ),
    );
  }

  get selectedableSchools() {
    if (!this.allSchoolsData.isResolved || !this.schoolPermissionsData.isResolved) {
      return [];
    }

    return this.schoolPermissionsData.value
      .filter((obj) => obj.canUpdate)
      .map(({ school }) => school);
  }

  @cached
  get userData() {
    return new TrackedAsyncData(this.currentUser.getModel());
  }

  get user() {
    return this.userData.isResolved ? this.userData.value : null;
  }

  get currentSchool() {
    if (this.selectedSchool) {
      return this.selectedSchool;
    }

    const schoolId = this.user?.belongsTo('school').id();

    return this.selectedableSchools.find((school) => school.id === schoolId);
  }

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

    const cohorts = [...this.cohortsData.value, ...this.cohortsToAdd].filter(
      (c) => !this.cohortsToRemove.includes(c),
    );

    if (!this.currentPrimaryCohort) {
      return cohorts;
    }
    return cohorts.filter((cohort) => {
      return cohort.id !== this.currentPrimaryCohort.id;
    });
  }

  get isLoaded() {
    return (
      this.primaryCohortData.isResolved &&
      this.cohortsData.isResolved &&
      this.allSchoolsData.isResolved &&
      this.schoolPermissionsData.isResolved &&
      this.userData.isResolved
    );
  }

  get currentPrimaryCohort() {
    if (this.newPrimaryCohort === null) {
      return null;
    }
    if (this.newPrimaryCohort === false) {
      return this.primaryCohort;
    }

    return this.newPrimaryCohort;
  }

  @action
  addSecondaryCohort(cohort) {
    this.cohortsToAdd = [...this.cohortsToAdd, cohort];
    this.cohortsToRemove = this.cohortsToRemove.filter((c) => c !== cohort);
  }

  @action
  removeSecondaryCohort(cohort) {
    this.cohortsToRemove = [...this.cohortsToRemove, cohort];
    this.cohortsToAdd = this.cohortsToAdd.filter((c) => c !== cohort);
  }

  cancel = restartableTask(async () => {
    this.reset();
    this.args.setIsManaging(false);
  });

  reset() {
    this.cohortsToAdd = [];
    this.cohortsToRemove = [];
    this.newPrimaryCohort = false;
  }

  save = dropTask(async () => {
    const cohorts = [this.currentPrimaryCohort, ...this.secondaryCohorts];
    this.args.user.primaryCohort = this.currentPrimaryCohort;
    this.args.user.cohorts = cohorts.filter(Boolean);
    await this.args.user.save();
    this.reset();
    this.args.setIsManaging(false);
    this.hasSavedRecently = true;
    await timeout(500);
    this.hasSavedRecently = false;
  });
}
