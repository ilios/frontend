<div class="new-competency" data-test-new-competency ...attributes>
  <input
    type="text"
    value={{this.title}}
    disabled={{this.save.isRunning}}
    data-test-title
    {{on "input" (pick "target.value" (set this "title"))}}
    {{on "keyup" (perform this.cancelOrSave)}}
    {{this.validations.attach "title"}}
    placeholder={{t "general.title"}}
    aria-label={{t "general.title"}}
  />
  <button
    type="button"
    class="save text"
    disabled={{this.save.isRunning}}
    data-test-save
    {{on "click" (perform this.save)}}
  >
    {{#if this.save.isRunning}}
      <LoadingSpinner />
    {{else}}
      {{t "general.add"}}
    {{/if}}
  </button>
  <YupValidationMessage
    @description={{t "general.title"}}
    @validationErrors={{this.validations.errors.title}}
    data-test-title-validation-error-message
  />
</div>