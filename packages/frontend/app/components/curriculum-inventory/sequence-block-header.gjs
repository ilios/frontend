<div
  class="curriculum-inventory-sequence-block-header"
  data-test-curriculum-inventory-sequence-block-header
  ...attributes
>
  <div class="title" data-test-title>
    {{#if @canUpdate}}
      <EditableField
        @value={{this.title}}
        @save={{perform this.changeTitle}}
        @close={{this.revertTitleChanges}}
        @saveOnEnter={{true}}
        @closeOnEscape={{true}}
        as |isSaving|
      >
        <input
          aria-label={{t "general.title"}}
          type="text"
          value={{this.title}}
          disabled={{isSaving}}
          {{on "input" (pick "target.value" (set this "title"))}}
          {{this.validations.attach "title"}}
        />
        <YupValidationMessage
          @description={{t "general.title"}}
          @validationErrors={{this.validations.errors.title}}
          data-test-title-validation-error-message
        />
      </EditableField>
    {{else}}
      <span class="h2">
        <FaIcon @icon="lock" />
        {{@sequenceBlock.title}}
      </span>
    {{/if}}
  </div>
</div>