import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import { faBuildingColumns, faPlus, faUsers, faXmark } from '@fortawesome/free-solid-svg-icons';
import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import t from 'ember-intl/helpers/t';
import { eq, gt } from 'ember-truth-helpers';
import { filter } from 'rsvp';

import includes from '../helpers/includes';
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
  get cohortProxiesData() {
    return new TrackedAsyncData(this.loadCohorts(this.args.course));
  }

  get cohortProxies() {
    return this.cohortProxiesData.isResolved ? this.cohortProxiesData.value : [];
  }

  get filteredCohortProxies() {
    return this.cohortProxies.filter(
      (obj) => obj.school === this.selectedSchool && obj.program === this.selectedProgram,
    );
  }

  /**
   * All cohorts for the selected school+program, sorted by:
   *
   * 1. owning school's title, ascending
   * 2. owning program's title, ascending
   * 3. cohort title, descending
   */
  get sortedCohortProxies() {
    const objects = this.filteredCohortProxies.map((obj) => {
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

  @cached
  get schools() {
    const schools = this.cohortProxies.map((p) => p.school);
    return [...new Map(schools.map((s) => [s.id, s])).values()].sort((a, b) =>
      a.get('title').localeCompare(b.get('title')),
    );
  }

  get selectedSchool() {
    const id = this.selectedSchoolId ?? this.args.course.belongsTo('school').id();
    return findById(this.schools, id) ?? this.schools[0];
  }

  @cached
  get programs() {
    const programs = this.cohortProxies
      .filter((p) => p.school === this.selectedSchool)
      .map((p) => p.program);
    return [...new Map(programs.map((p) => [p.id, p])).values()].sort((a, b) =>
      a.get('title').localeCompare(b.get('title')),
    );
  }

  @cached
  get defaultSelectedProgramData() {
    return new TrackedAsyncData(this.findBestDefaultProgram(this.programs));
  }

  get defaultSelectedProgram() {
    return this.defaultSelectedProgramData.isResolved
      ? this.defaultSelectedProgramData.value
      : null;
  }

  get selectedProgram() {
    if (!this.programs) {
      return null;
    }
    if (this.selectedProgramId) {
      return findById(this.programs, this.selectedProgramId);
    }

    return this.defaultSelectedProgram;
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

  async findBestDefaultProgram(programs) {
    if (!programs) {
      return null;
    }
    const sortingPrograms = await Promise.all(
      programs.map(async (program) => {
        const thisYear = new Date().getFullYear();
        const programYears = await program.programYears;
        const sorters = await Promise.all(
          programYears.map(async (programYear) => {
            const groupCount = (await programYear.cohort).hasMany('learnerGroups').ids().length;
            return {
              distanceFromThisYear: thisYear - Number(programYear.startYear),
              groupCount,
            };
          }),
        );
        return sorters.reduce(
          (obj, sorter) => {
            if (sorter.distanceFromThisYear < obj.distance) {
              obj.distance = sorter.distanceFromThisYear;
            }
            obj.totalGroups += sorter.groupCount;
            return obj;
          },
          {
            title: program.title,
            program,
            totalGroups: 0,
            distance: 100,
          },
        );
      }),
    );
    const sorted = sortingPrograms.sort((a, b) => {
      if (a.distance !== b.distance) {
        return a.distance - b.distance;
      }
      if (a.totalGroups !== b.totalGroups) {
        return b.totalGroups - a.totalGroups;
      }

      return a.title.localeCompare(b.title);
    });

    return sorted[0]?.program;
  }
  <template>
    <section class="detail-cohort-manager" data-test-detail-cohort-manager>
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
      {{#if this.cohortProxiesData.isResolved}}
        <div class="filters">
          <div class="filter">
            <FaIcon @icon={{faBuildingColumns}} @fixedWidth={{true}} />
            {{#if (gt this.schools.length 1)}}
              <select
                {{on "change" (pick "target.value" this.setSchoolId)}}
                aria-label={{t "general.schools"}}
                data-test-school-filter
              >
                {{#each this.schools as |school|}}
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
            {{#if (gt this.programs.length 1)}}
              <select
                {{on "change" (pick "target.value" this.setProgramId)}}
                aria-label={{t "general.programs"}}
                data-test-program-filter
              >
                {{#each this.programs as |program|}}
                  <option value={{program.id}} selected={{eq program.id this.selectedProgram.id}}>
                    {{program.title}}
                  </option>
                {{/each}}
              </select>
            {{else if (eq this.programs.length 1)}}
              {{this.selectedProgram.title}}
            {{else}}
              {{t "general.none"}}
            {{/if}}
          </div>
        </div>

        <ul class="selectable-cohorts">
          {{#each this.sortedCohortProxies as |cohort|}}
            {{#let (includes cohort @selectedCohorts) as |isSelected|}}
              <li data-test-selectable-cohort>
                <button
                  type="button"
                  class="selected-cohorts-list-item{{if isSelected ' selected'}}"
                  {{on "click" (if isSelected (fn @remove cohort) (fn @add cohort))}}
                >
                  <span data-test-title>
                    {{cohort.programYear.program.school.title}}
                    |
                    {{cohort.programYear.program.title}}
                    |
                    {{cohort.title}}
                  </span>
                  <span class="actions">
                    {{#if isSelected}}
                      <FaIcon @icon={{faXmark}} class="remove" data-test-remove />
                    {{else}}
                      <FaIcon @icon={{faPlus}} class="add" data-test-add />
                    {{/if}}
                  </span>
                </button>
              </li>
            {{/let}}
          {{/each}}
        </ul>
      {{else}}
        <LoadingSpinner />
      {{/if}}
    </section>
  </template>
}
