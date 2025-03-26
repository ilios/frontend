<div class="session-header" data-test-session-header>
  <h3 class="title" data-test-title>
    {{#if @editable}}
      <EditableField
        @value={{this.title}}
        @save={{perform this.changeTitle}}
        @close={{this.resetTitle}}
        @saveOnEnter={{true}}
        @closeOnEscape={{true}}
        as |isSaving|
      >
        <input
          aria-label={{t "general.title"}}
          disabled={{isSaving}}
          type="text"
          value={{this.title}}
          {{on "input" (pick "target.value" (set this "title"))}}
          {{this.validations.attach "title"}}
        />
        <YupValidationMessage
          @description={{t "general.title"}}
          @validationErrors={{this.validations.errors.title}}
        />
      </EditableField>
    {{else}}
      {{@session.title}}
    {{/if}}
  </h3>
  <span class="session-publication">
    {{#if @editable}}
      <Session::PublicationMenu @session={{@session}} @hideCheckLink={{@hideCheckLink}} />
    {{else}}
      <PublicationStatus @item={{@session}} />
    {{/if}}
  </span>
</div>