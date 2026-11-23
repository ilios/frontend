import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import { faBuildingColumns, faUsers, faXmark } from '@fortawesome/free-solid-svg-icons';
import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import t from 'ember-intl/helpers/t';
import { eq, gt } from 'ember-truth-helpers';
import { filter } from 'rsvp';

import pick from '../helpers/pick';
import sortBy from '../helpers/sort-by';
import { findById, mapBy } from '../utils/array-helpers';
import LoadingSpinner from './loading-spinner';

export default class DetailCohortManagerComponent extends Component {
  @service intl;
  @service store;
  @service permissionChecker;
  @tracked filter = '';
  @tracked selectedSchoolId = null;
  @tracked selectedProgramId = null;

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

  get availableSchools() {
    const schools = this.availableCohortProxies.map((p) => p.school);
    return [...new Map(schools.map((s) => [s.id, s])).values()].sort((a, b) =>
      a.get('title').localeCompare(b.get('title')),
    );
  }

  get selectedSchool() {
    const id = this.selectedSchoolId ?? this.args.course.belongsTo('school').id();
    return findById(this.availableSchools, id) ?? this.availableSchools[0];
  }

  get availablePrograms() {
    const programs = this.availableCohortProxies
      .filter((p) => p.school === this.selectedSchool)
      .map((p) => p.program);
    return [...new Map(programs.map((p) => [p.id, p])).values()].sort((a, b) =>
      a.get('title').localeCompare(b.get('title')),
    );
  }

  // rank programs by most-recent program year, then by cohort count
  get bestDefaultProgram() {
    const thisYear = new Date().getFullYear();
    const schoolProxies = this.availableCohortProxies.filter(
      (p) => p.school === this.selectedSchool,
    );
    const byProgram = schoolProxies.reduce((map, p) => {
      const key = p.program.id;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(p);
      return map;
    }, new Map());
    const ranked = [...byProgram.values()].map((proxies) => {
      const program = proxies[0].program;
      const minDistance = Math.min(
        ...proxies.map((p) => thisYear - Number(p.programYear.startYear)),
      );
      return { program, minDistance, count: proxies.length };
    });
    ranked.sort((a, b) => {
      if (a.minDistance !== b.minDistance) return a.minDistance - b.minDistance;
      if (a.count !== b.count) return b.count - a.count;
      return a.program.get('title').localeCompare(b.program.get('title'));
    });
    return ranked[0]?.program ?? null;
  }

  get selectedProgram() {
    return findById(this.availablePrograms, this.selectedProgramId) ?? this.bestDefaultProgram;
  }

  get unselectedAvailableCohortProxies() {
    if (!this.availableCohortProxies.length) {
      return [];
    }
    const selectedCohorts = this.args.selectedCohorts || [];

    return this.availableCohortProxies.filter((obj) => !selectedCohorts.includes(obj.cohort));
  }

  get filteredUnselectedCohortProxies() {
    return this.unselectedAvailableCohortProxies.filter(
      (obj) => obj.school === this.selectedSchool && obj.program === this.selectedProgram,
    );
  }

  /**
   * All available cohorts, sorted by:
   *
   * 1. owning school's title, ascending
   * 2. owning program's title, ascending
   * 3. cohort title, descending
   */
  get sortedAvailableCohorts() {
    const objects = this.filteredUnselectedCohortProxies.map((obj) => {
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

  @action
  setSchoolId(id) {
    this.selectedSchoolId = id;
    this.selectedProgramId = null;
  }

  @action
  setProgramId(id) {
    this.selectedProgramId = id;
  }

  async loadCohorts(course) {
    const school = await course.school;
    const allCohorts = await this.store.findAll('cohort');
    const cohortProxies = await Promise.all(
      allCohorts.map(async (cohort) => {
        const programYear = await cohort.programYear;
        const program = await programYear.program;
        const school = await program.school;

        return { school, program, programYear, cohort };
      }),
    );

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
    <section class="detail-cohort-manager" data-test-detail-cohort-manager>
      {{#if this.isLoaded}}
        <div class="filters">
          <div class="filter">
            <FaIcon @icon={{faBuildingColumns}} @fixedWidth={{true}} />
            {{#if (gt this.availableSchools.length 1)}}
              <select
                {{on "change" (pick "target.value" this.setSchoolId)}}
                aria-label={{t "general.schools"}}
                data-test-school-filter
              >
                {{#each this.availableSchools as |school|}}
                  <option value={{school.id}} selected={{eq school.id this.selectedSchool.id}}>
                    {{school.title}}
                  </option>
                {{/each}}
              </select>
            {{else}}
              {{this.selectedSchool.title}}
            {{/if}}
          </div>
          <div class="filter">
            <FaIcon @icon={{faUsers}} @fixedWidth={{true}} />
            {{#if (gt this.availablePrograms.length 1)}}
              <select
                {{on "change" (pick "target.value" this.setProgramId)}}
                aria-label={{t "general.programs"}}
                data-test-program-filter
              >
                {{#each this.availablePrograms as |program|}}
                  <option value={{program.id}} selected={{eq program.id this.selectedProgram.id}}>
                    {{program.title}}
                  </option>
                {{/each}}
              </select>
            {{else if (eq this.availablePrograms.length 1)}}
              {{this.selectedProgram.title}}
            {{else}}
              {{t "general.none"}}
            {{/if}}
          </div>
        </div>
      {{/if}}
      {{#if @selectedCohorts.length}}
        <ul class="selected-cohorts">
          {{#each (sortBy "title" @selectedCohorts) as |cohort|}}
            <li data-test-selected-cohort>
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
            <li data-test-selectable-cohort>
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
