<div class="school-vocabulary-new-term" data-test-school-vocabulary-new-term>
  <input
    aria-label={{t "general.title"}}
    type="text"
    value={{this.title}}
    disabled={{this.save.isRunning}}
    {{on "input" (pick "target.value" (set this "title"))}}
    {{on "keyup" (perform this.saveOnEnter)}}
    {{this.validations.attach "title"}}
  />
  <button
    type="button"
    class="save text"
    disabled={{this.save.isRunning}}
    {{on "click" (perform this.save)}}
  >
    {{#if this.save.isRunning}}
      <LoadingSpinner />
    {{else}}
      {{t "general.add"}}
    {{/if}}
  </button>
  <YupValidationMessage
    @description={{t "general.term"}}
    @validationErrors={{this.validations.errors.title}}
    data-test-title-validation-error-message
  />
</div>