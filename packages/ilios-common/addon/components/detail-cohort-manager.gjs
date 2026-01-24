import Component from '@glimmer/component';
import { service } from '@ember/service';
import { cached, tracked } from '@glimmer/tracking';
import { map, filter } from 'rsvp';
import { mapBy } from 'ilios-common/utils/array-helpers';
import { TrackedAsyncData } from 'ember-async-data';
import sortBy from 'ilios-common/helpers/sort-by';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import LoadingSpinner from 'ilios-common/components/loading-spinner';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

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

      return obj.programEndYear >= minEndYear;
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
  <template>
    <section class="detail-cohort-manager">
      {{#if @selectedCohorts.length}}
        <ul class="selected-cohorts">
          {{#each (sortBy "title" @selectedCohorts) as |cohort|}}
            <li>
              <button type="button" {{on "click" (fn @remove cohort)}}>
                {{cohort.programYear.program.school.title}}
                |
                {{cohort.programYear.program.title}}
                |
                {{cohort.title}}
                <FaIcon @icon={{faXmark}} class="remove" />
              </button>
            </li>
          {{/each}}
        </ul>
      {{/if}}
      <ul class="selectable-cohorts">
        {{#if this.isLoaded}}
          {{#each this.sortedAvailableCohorts as |cohort|}}
            <li>
              <button type="button" {{on "click" (fn @add cohort)}}>
                {{cohort.programYear.program.school.title}}
                |
                {{cohort.programYear.program.title}}
                |
                {{cohort.title}}
              </button>
            </li>
          {{/each}}
        {{else}}
          <li>
            <LoadingSpinner />
          </li>
        {{/if}}
      </ul>
    </section>
  </template>
}
