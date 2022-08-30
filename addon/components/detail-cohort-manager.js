import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { restartableTask } from 'ember-concurrency';
import { map, filter } from 'rsvp';

export default class DetailCohortManagerComponent extends Component {
  @service intl;
  @service store;
  @service permissionChecker;

  @tracked filter = '';
  @tracked availableCohortProxies = null;

  load = restartableTask(async (event, [school]) => {
    if (!school) {
      return false;
    }
    const allCohorts = await this.store.findAll('cohort');
    const cohortProxies = await map(allCohorts.toArray(), async (cohort) => {
      const programYear = await cohort.programYear;
      const program = await programYear.program;
      const school = await program.school;

      return { school, program, programYear, cohort };
    });

    this.availableCohortProxies = await filter(cohortProxies, async (obj) => {
      if (obj.school === school) {
        return true;
      }
      if (await this.permissionChecker.canUpdateAllCoursesInSchool(obj.school)) {
        return true;
      }
      if (await this.permissionChecker.canUpdateProgramYear(obj.programYear)) {
        return true;
      }

      return false;
    });

    return true;
  });

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

    return objects.mapBy('cohort');
  }
}
