<p data-test-reports-subject-new-term>
  <label for="new-term">
    {{t "general.whichIs"}}
  </label>
  {{#if this.allTermsData.isResolved}}
    <select
      id="new-term"
      data-test-prepositional-objects
      {{on "change" this.updatePrepositionalObjectId}}
    >
      <option selected={{is-empty @currentId}} value="">
        {{t "general.selectPolite"}}
      </option>
      {{#each this.sortedTerms as |obj|}}
        <option selected={{eq obj.term.id this.bestSelectedTerm}} value={{obj.term.id}}>
          {{obj.vocabulary.title}}
          >
          {{obj.title}}
          {{#unless obj.term.active}}
            ({{t "general.inactive"}})
          {{/unless}}
        </option>
      {{/each}}
    </select>
  {{else}}
    <LoadingSpinner />
  {{/if}}
</p>