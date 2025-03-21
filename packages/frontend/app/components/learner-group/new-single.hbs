{{#let (unique-id) as |templateId|}}
  <div class="form" ...attributes data-test-new-single-learner-group>
    <div class="item" data-test-title>
      <label for="title-{{templateId}}">
        {{t "general.title"}}:
      </label>
      <input
        id="title-{{templateId}}"
        type="text"
        disabled={{this.save.isRunning}}
        placeholder={{t "general.learnerGroupTitlePlaceholder"}}
        value={{this.title}}
        {{on "keyup" this.keyboard}}
        {{on "input" (pick "target.value" (set this "title"))}}
        {{this.validations.attach "title"}}
      />
      <YupValidationMessage
        @description={{t "general.title"}}
        @validationErrors={{this.validations.errors.title}}
        data-test-title-validation-error-message
      />
    </div>
    {{#if @fillModeSupported}}
      <div class="item">
        <label>
          {{t "general.populateGroup"}}:
        </label>
        <div>
          <label data-test-fill>
            <input
              checked={{this.fillWithCohort}}
              type="radio"
              {{on "click" (toggle "fillWithCohort" this)}}
            />
            {{t "general.yesPopulateGroup"}}
          </label>
        </div>
        <div>
          <label data-test-no-fill>
            <input
              checked={{not this.fillWithCohort}}
              type="radio"
              {{on "click" (toggle "fillWithCohort" this)}}
            />
            {{t "general.noPopulateGroup"}}
          </label>
        </div>
      </div>
    {{/if}}
    <div class="buttons">
      <button type="button" class="done text" {{on "click" (perform this.save)}}>
        {{#if this.save.isRunning}}
          <LoadingSpinner />
        {{else}}
          {{t "general.done"}}
        {{/if}}
      </button>
      <button type="button" class="cancel text" {{on "click" @cancel}}>
        {{t "general.cancel"}}
      </button>
    </div>
  </div>
{{/let}}