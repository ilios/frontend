<p data-test-reports-subject-new-academic-year>
  <label for="new-term">
    {{t "general.whichIs"}}
  </label>
  {{#if this.academicYearsData.isResolved}}
    <select
      id="new-academic-year"
      data-test-prepositional-objects
      {{on "change" this.updatePrepositionalObjectId}}
    >
      <option selected={{is-empty @currentId}} value="">
        {{t "general.selectPolite"}}
      </option>
      {{#each this.sortedAcademicYears as |year|}}
        <option selected={{eq year.id this.bestSelectedAcademicYear}} value={{year.id}}>
          {{#if this.academicYearCrossesCalendarYearBoundaries}}
            {{year.id}}
            -
            {{add year.id 1}}
          {{else}}
            {{year.id}}
          {{/if}}
        </option>
      {{/each}}
    </select>
  {{else}}
    <LoadingSpinner />
  {{/if}}
</p>