import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { TrackedAsyncData } from 'ember-async-data';
import { findById } from 'ilios-common/utils/array-helpers';
import sortCohorts from 'frontend/utils/sort-cohorts';

export default class UserProfileCohortsManagerComponent extends Component {
  @service currentUser;
  @service permissionChecker;
  @service store;

  @cached
  get secondaryCohortsData() {
    return new TrackedAsyncData(sortCohorts(this.args.secondaryCohorts));
  }

  get secondaryCohorts() {
    return this.secondaryCohortsData.isResolved ? this.secondaryCohortsData.value : [];
  }

  @cached
  get selectableCohortsData() {
    return new TrackedAsyncData(
      this.getSelectableCohortsBySchool(
        this.args.selectedSchool,
        this.args.primaryCohort,
        this.args.secondaryCohorts,
      ),
    );
  }

  async getSelectableCohortsBySchool(school, selectedPrimaryCohort, selectedSecondaryCohorts) {
    const programs = await school.programs;
    const programYears = (await Promise.all(programs.map((p) => p.programYears))).flat();
    const cohorts = await Promise.all(programYears.map((py) => py.cohort));
    const sortedCohorts = await sortCohorts(cohorts);

    return sortedCohorts.filter((cohort) => {
      // filter cohorts through relevant range
      const programYearStartYear = Number(cohort.programYear.content.startYear);
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

  @action
  changeSchool(schoolId) {
    this.args.setSchool(findById(this.args.schools, schoolId));
  }
}
