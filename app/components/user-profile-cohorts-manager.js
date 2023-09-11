import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { TrackedAsyncData } from 'ember-async-data';
import { filter } from 'rsvp';
import { findById } from 'ilios-common/utils/array-helpers';
import sortCohorts from 'ilios/utils/sort-cohorts';

export default class UserProfileCohortsManagerComponent extends Component {
  @service currentUser;
  @service permissionChecker;
  @service store;

  @tracked selectedSchool = null;

  @cached
  get secondaryCohortsData() {
    return new TrackedAsyncData(
      this.sortAndFilterSecondaryCohorts(this.args.primaryCohort, this.args.secondaryCohorts),
    );
  }

  async sortAndFilterSecondaryCohorts(primaryCohort, secondaryCohorts) {
    const sortedCohorts = await sortCohorts(secondaryCohorts);
    if (primaryCohort) {
      return sortedCohorts.filter((cohort) => cohort !== this.args.primaryCohort);
    }
    return sortedCohorts;
  }

  get secondaryCohorts() {
    return this.secondaryCohortsData.isResolved ? this.secondaryCohortsData.value : [];
  }

  @cached
  get allSchoolsData() {
    return new TrackedAsyncData(this.getAllSelectableSchools());
  }

  get allSchools() {
    return this.allSchoolsData.isResolved ? this.allSchoolsData.value : [];
  }

  get allSchoolsLoaded() {
    return this.allSchoolsData.isResolved;
  }

  @cached
  get userData() {
    return new TrackedAsyncData(this.currentUser.getModel());
  }

  get user() {
    return this.userData.isResolved ? this.userData.value : null;
  }

  @cached
  get userSchoolData() {
    return new TrackedAsyncData(this.user?.school);
  }

  get userSchool() {
    return this.userSchoolData.isResolved ? this.userSchoolData.value : null;
  }

  async getAllSelectableSchools() {
    const schools = (await this.store.findAll('school')).slice();
    return filter(schools, async (school) => {
      return this.permissionChecker.canUpdateUserInSchool(school);
    });
  }

  @cached
  get selectableCohortsData() {
    if (this.selectedSchool) {
      return new TrackedAsyncData(this.getSelectableCohortsBySchool(this.selectedSchool));
    } else if (this.userSchool) {
      return new TrackedAsyncData(this.getSelectableCohortsBySchool(this.userSchool));
    } else {
      return new TrackedAsyncData([]);
    }
  }

  async getSelectableCohortsBySchool(school) {
    const programs = await school.programs;
    const programYears = (await Promise.all(programs.map((p) => p.programYears))).flat();
    const cohorts = await Promise.all(programYears.map((py) => py.cohort));
    const sortedCohorts = await sortCohorts(cohorts);
    return sortedCohorts.filter((cohort) => {
      return this.args.primaryCohort !== cohort && !this.args.secondaryCohorts.includes(cohort);
    });
  }

  get selectableCohorts() {
    return this.selectableCohortsData.isResolved ? this.selectableCohortsData.value : [];
  }

  get selectableCohortsLoaded() {
    return this.selectableCohortsData.isResolved;
  }

  @action
  changeSchool(schoolId) {
    this.selectedSchool = findById(this.allSchools, schoolId);
  }
}
