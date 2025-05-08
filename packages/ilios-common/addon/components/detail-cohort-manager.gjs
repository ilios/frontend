<section class="detail-cohort-manager">
  <ul class="selected-cohorts">
    {{#each (sort-by "title" @selectedCohorts) as |cohort|}}
      <li>
        <button type="button" {{on "click" (fn @remove cohort)}}>
          {{cohort.programYear.program.school.title}}
          |
          {{cohort.programYear.program.title}}
          |
          {{cohort.title}}
          <FaIcon @icon="xmark" class="remove" />
        </button>
      </li>
    {{/each}}
  </ul>
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