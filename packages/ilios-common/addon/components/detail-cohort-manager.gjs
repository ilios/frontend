import Component from '@glimmer/component';
import { service } from '@ember/service';
import { cached, tracked } from '@glimmer/tracking';
import { map, filter } from 'rsvp';
import { mapBy } from 'ilios-common/utils/array-helpers';
import { TrackedAsyncData } from 'ember-async-data';

export default class DetailCohortManagerComponent extends Component {
  @service intl;
  @service store;
  @service permissionChecker;
  @tracked filter = '';

  @cached
  get proxiesData() {
    return new TrackedAsyncData(this.loadCohorts(this.args.course));
  }

  get isLoaded() {
    return this.proxiesData.isResolved;
  }

  get availableCohortProxies() {
    return this.proxiesData.isResolved ? this.proxiesData.value : [];
  }

  get unselectedAvailableCohortProxies() {
    if (!this.availableCohortProxies.length) {
      return [];
    }
    const selectedCohorts = this.args.selectedCohorts || [];

    return this.availableCohortProxies.filter((obj) => !selectedCohorts.includes(obj.cohort));
  }

  /**
   * All available cohorts, sorted by:
   *
   * 1. owning school's title, ascending
   * 2. owning program's title, ascending
   * 3. cohort title, descending
   */
  get sortedAvailableCohorts() {
    const objects = this.unselectedAvailableCohortProxies.map((obj) => {
      const sortTitle = obj.school.get('title') + obj.program.get('title');
      const programEndYear = parseInt(obj.programYear.startYear) + obj.program.duration;

      return {
        cohort: obj.cohort,
        sortTitle,
        cohortTitle: obj.cohort.title,
        programDuration: obj.program.duration,
        programEndYear,
      };
    });

    objects.sort((obj1, obj2) => {
      let compare = obj1.sortTitle.localeCompare(obj2.sortTitle);
      if (compare === 0) {
        //cohort titles are sorted descending
        compare = -obj1.cohortTitle.localeCompare(obj2.cohortTitle);
      }

      return compare;
    });

    // filter cohorts through relevant range
    const objectsFiltered = objects.filter((obj) => {
      const curYear = new Date().getFullYear();
      const minEndYear = curYear - obj.programDuration;
      const maxEndYear = curYear + obj.programDuration;

      return obj.programEndYear >= minEndYear && obj.programEndYear <= maxEndYear;
    });

    return mapBy(objectsFiltered, 'cohort');
  }

  async loadCohorts(course) {
    const school = await course.school;
    const allCohorts = await this.store.findAll('cohort');
    const cohortProxies = await map(allCohorts, async (cohort) => {
      const programYear = await cohort.programYear;
      const program = await programYear.program;
      const school = await program.school;

      return { school, program, programYear, cohort };
    });

    return filter(cohortProxies, async (obj) => {
      if (obj.school === school) {
        return true;
      }
      if (await this.permissionChecker.canUpdateAllCoursesInSchool(obj.school)) {
        return true;
      }
      return !!(await this.permissionChecker.canUpdateProgramYear(obj.programYear));
    });
  }
}
