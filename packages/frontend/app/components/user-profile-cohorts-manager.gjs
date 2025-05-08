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

<div class="user-profile-cohorts-manager" data-test-user-profile-cohorts-manager>
  <p data-test-primary-cohort>
    <h4>
      {{t "general.primaryCohort"}}:
    </h4>
    {{#if @primaryCohort}}
      <button
        type="button"
        class="link-button"
        {{on "click" (fn @setPrimaryCohort null)}}
        data-test-remove
      >
        <FaIcon
          @icon="turn-down"
          class="clickable remove"
          @title={{t "general.removePrimaryCohort"}}
        />
      </button>
      <span data-test-title>
        {{@primaryCohort.programYear.program.school.title}}
        <strong>
          {{@primaryCohort.programYear.program.title}}
        </strong>
        {{@primaryCohort.title}}
      </span>
    {{else}}
      <span data-test-title>{{t "general.none"}}</span>
    {{/if}}
  </p>
  <p data-test-secondary-cohorts>
    <h4>
      {{t "general.secondaryCohorts"}}:
    </h4>
    <ul>
      {{#each this.secondaryCohorts as |cohort|}}
        <li>
          <button
            class="link-button"
            type="button"
            {{on "click" (fn @setPrimaryCohort cohort)}}
            data-test-promote
          >
            <FaIcon
              @icon="turn-up"
              class="clickable add"
              @title={{t "general.promoteToPrimaryCohort"}}
            />
          </button>
          <button
            class="link-button"
            type="button"
            {{on "click" (fn @removeSecondaryCohort cohort)}}
            data-test-remove
          >
            <FaIcon @icon="xmark" class="clickable remove" @title={{t "general.removeCohort"}} />
          </button>
          <span data-test-title>
            {{cohort.programYear.program.school.title}}
            <strong>
              {{cohort.programYear.program.title}}
            </strong>
            {{cohort.title}}
          </span>
        </li>
      {{else}}
        <li>
          <span data-test-title>
            {{t "general.none"}}
          </span>
        </li>
      {{/each}}
    </ul>
  </p>
  <p class="select-available-cohort">
    <h4>
      {{t "general.availableCohorts"}}
    </h4>
    <div class="schoolsfilter" data-test-schools>
      <FaIcon @icon="building-columns" @fixedWidth={{true}} />
      {{#if (gt @schools.length 1)}}
        <select
          aria-label={{t "general.schools"}}
          {{on "change" (pick "target.value" this.changeSchool)}}
          data-test-filter
        >
          {{#each (sort-by "title" @schools) as |school|}}
            <option
              value={{school.id}}
              selected={{eq school (if @selectedSchool @selectedSchool this.userSchool)}}
            >
              {{school.title}}
            </option>
          {{/each}}
        </select>
      {{else}}
        {{@selectedSchool.title}}
      {{/if}}
    </div>
    {{#if this.selectableCohortsData.isResolved}}
      <ul data-test-assignable-cohorts>
        {{#each this.selectableCohorts as |cohort|}}
          <li data-test-assignable-cohort>
            <button
              type="button"
              class="link-button"
              {{on "click" (fn @addSecondaryCohort cohort)}}
              data-test-add
            >
              <FaIcon @icon="plus" class="clickable add" @title={{t "general.addCohort"}} />
            </button>
            <span data-test-title>
              <strong>
                {{cohort.programYear.program.title}}
              </strong>
              {{cohort.title}}
            </span>
          </li>
        {{else}}
          <li>
            <span data-test-title>
              {{t "general.none"}}
            </span>
          </li>
        {{/each}}
      </ul>
    {{else}}
      <LoadingSpinner />
    {{/if}}
  </p>
</div>