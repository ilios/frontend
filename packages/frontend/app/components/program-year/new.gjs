<div class="new-program-year" data-test-new-program-year ...attributes>
  <h4 class="title" data-test-title>
    {{t "general.newProgramYear"}}
  </h4>
  <div class="form">
    <div class="startyear-select" data-test-start-year>
      {{#let (unique-id) as |yearId|}}
        <label for={{yearId}}>
          {{t "general.academicYear"}}:
        </label>
        <select
          id={{yearId}}
          {{on "change" (pick "target.value" (set this "year"))}}
          data-test-year
        >
          {{#each (sort-by "value" this.availableAcademicYears) as |obj|}}
            <option value={{obj.value}} selected={{eq obj.value this.selectedYear.value}}>
              {{obj.label}}
            </option>
          {{/each}}
        </select>
      {{/let}}
    </div>
    <div class="buttons">
      <button
        type="button"
        class="done text"
        {{on "click" (perform this.saveNewYear)}}
        data-test-done
      >
        {{#if this.saveNewYear.isRunning}}
          <LoadingSpinner />
        {{else}}
          {{t "general.done"}}
        {{/if}}
      </button>
      <button type="button" class="cancel text" {{on "click" @cancel}} data-test-cancel>
        {{t "general.cancel"}}
      </button>
    </div>
  </div>
</div>