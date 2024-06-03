import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { TrackedAsyncData } from 'ember-async-data';
import { filter } from 'rsvp';
import { findById } from 'ilios-common/utils/array-helpers';
import sortCohorts from 'frontend/utils/sort-cohorts';

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
      return new TrackedAsyncData(
        this.getSelectableCohortsBySchool(
          this.selectedSchool,
          this.args.primaryCohort,
          this.args.secondaryCohorts,
        ),
      );
    } else if (this.userSchool) {
      return new TrackedAsyncData(
        this.getSelectableCohortsBySchool(
          this.userSchool,
          this.args.primaryCohort,
          this.args.secondaryCohorts,
        ),
      );
    } else {
      return new TrackedAsyncData([]);
    }
  }

  async getSelectableCohortsBySchool(school, selectedPrimaryCohort, selectedSecondaryCohorts) {
    const programs = await school.programs;
    const programYears = (await Promise.all(programs.map((p) => p.programYears))).flat();
    const cohorts = await Promise.all(programYears.map((py) => py.cohort));
    const sortedCohorts = await sortCohorts(cohorts);

    return sortedCohorts.filter((cohort) => {
      // filter cohorts through relevant range
      const programYearStartYear = parseInt(cohort.programYear.content.startYear);
      const programDuration = cohort.programYear.content.program.content.duration;
      const curYear = new Date().getFullYear();
      const programEndYear = programYearStartYear + programDuration;
      const minEndYear = curYear - programDuration;
      const maxEndYear = curYear + programDuration;

      return (
        selectedPrimaryCohort !== cohort &&
        !selectedSecondaryCohorts.includes(cohort) &&
        programEndYear >= minEndYear &&
        programEndYear <= maxEndYear
      );
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
