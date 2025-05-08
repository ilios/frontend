<div
  class="curriculum-inventory-report-header"
  data-test-curriculum-inventory-report-header
  ...attributes
>
  <div class="title" data-test-name>
    {{#if @canUpdate}}
      <EditableField
        @value={{if this.name this.name (t "general.clickToEdit")}}
        @save={{perform this.saveName}}
        @close={{this.revertNameChanges}}
        @saveOnEnter={{true}}
        @closeOnEscape={{true}}
        as |isSaving|
      >
        <input
          aria-label={{t "general.title"}}
          type="text"
          value={{this.name}}
          disabled={{isSaving}}
          {{on "input" (pick "target.value" (set this "name"))}}
          {{this.validations.attach "name"}}
        />
        <YupValidationMessage
          @description={{t "general.name"}}
          @validationErrors={{this.validations.errors.name}}
          data-test-name-validation-error-message
        />
      </EditableField>
    {{else}}
      <h2 data-test-locked-name>
        <FaIcon @icon="lock" />
        {{@report.name}}
      </h2>
    {{/if}}
  </div>
  <div class="actions">
    <a
      class="download"
      download="report.xml"
      href={{@report.absoluteFileUri}}
      rel="noopener noreferrer"
      target="_blank"
      data-test-download
    >
      {{t "general.download"}}
    </a>
    <button
      type="button"
      class="finalize"
      disabled={{not @canUpdate}}
      {{on "click" @finalize}}
      data-test-finalize
    >
      {{t "general.finalize"}}
      {{#if @isFinalizing}}
        <FaIcon @icon="spinner" @spin={{true}} />
      {{/if}}
    </button>
  </div>
</div>