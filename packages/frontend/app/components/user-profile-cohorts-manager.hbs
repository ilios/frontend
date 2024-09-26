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