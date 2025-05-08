<span class="competency-title-editor" data-test-competency-title-editor>
  {{#if @canUpdate}}
    <EditableField
      @value={{this.title}}
      @save={{perform this.save}}
      @close={{this.revert}}
      @saveOnEnter={{true}}
      data-test-title
      @closeOnEscape={{true}}
      as |isSaving|
    >
      <input
        type="text"
        value={{this.title}}
        disabled={{isSaving}}
        aria-label={{t "general.title"}}
        {{on "input" (pick "target.value" (set this "title"))}}
        {{this.validations.attach "title"}}
      />
    </EditableField>
    <YupValidationMessage
      @description={{t "general.title"}}
      @validationErrors={{this.validations.errors.title}}
      data-test-title-validation-error-message
    />
  {{else}}
    {{this.title}}
  {{/if}}
</span>