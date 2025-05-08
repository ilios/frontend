<p data-test-reports-subject-new-instructor-group>
  <label for="new-instructor-group">
    {{t "general.whichIs"}}
  </label>
  {{#if this.allInstructorGroupsData.isResolved}}
    <select
      id="new-instructor-group"
      data-test-prepositional-objects
      {{on "change" this.updatePrepositionalObjectId}}
    >
      <option selected={{is-empty @currentId}} value="">
        {{t "general.selectPolite"}}
      </option>
      {{#each this.sortedInstructorGroups as |instructorGroup|}}
        <option
          selected={{eq instructorGroup.id this.bestSelectedInstructorGroup}}
          value={{instructorGroup.id}}
        >
          {{instructorGroup.title}}
        </option>
      {{/each}}
    </select>
  {{else}}
    <LoadingSpinner />
  {{/if}}
</p>