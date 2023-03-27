import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { map, filter } from 'rsvp';
import { mapBy } from 'ilios-common/utils/array-helpers';
import { use } from 'ember-could-get-used-to-this';
import AsyncProcess from 'ilios-common/classes/async-process';

export default class DetailCohortManagerComponent extends Component {
  @service intl;
  @service store;
  @service permissionChecker;
  @tracked filter = '';
  @use proxies = new AsyncProcess(() => [this.loadCohorts.bind(this), this.args.course]);

  get isLoaded() {
    return !!this.proxies;
  }

  get availableCohortProxies() {
    if (!this.proxies) {
      return [];
    }
    return this.proxies;
  }

  get unselectedAvailableCohortProxies() {
    if (!this.availableCohortProxies) {
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

      return {
        cohort: obj.cohort,
        sortTitle,
        cohortTitle: obj.cohort.title,
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

    return mapBy(objects, 'cohort');
  }

  async loadCohorts(course) {
    const school = await course.school;
    const allCohorts = await this.store.findAll('cohort');
    const cohortProxies = await map(allCohorts.slice(), async (cohort) => {
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
