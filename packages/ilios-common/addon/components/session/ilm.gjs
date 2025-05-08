<div class="session-ilm block" data-test-session-ilm>
  <label>{{t "general.independentLearning"}}:</label>
  <span class="ilm-value" data-test-ilm-value>
    {{#if @editable}}
      <ToggleYesno
        @yes={{this.isIndependentLearning}}
        @toggle={{perform this.saveIndependentLearning}}
        data-test-ilm-toggle
      />
    {{else}}
      {{#if this.isIndependentLearning}}
        <span class="add">{{t "general.yes"}}</span>
      {{else}}
        <span class="remove">{{t "general.no"}}</span>
      {{/if}}
    {{/if}}
  </span>
</div>
{{#if this.isIndependentLearning}}
  <div class="hours block" data-test-ilm-hours>
    <label for="hours-{{this.uniqueId}}">{{t "general.hours"}}:</label>
    <span>
      {{#if @editable}}
        <EditableField
          @value={{this.hours}}
          @save={{perform this.changeIlmHours}}
          @close={{this.resetHours}}
          @saveOnEnter={{true}}
          @closeOnEscape={{true}}
          as |isSaving|
        >
          <input
            id="hours-{{this.uniqueId}}"
            disabled={{isSaving}}
            type="text"
            value={{this.hours}}
            {{this.validations.attach "hours"}}
            {{on "input" (pick "target.value" (set this "localHours"))}}
          />
          <YupValidationMessage
            @description={{t "general.hours"}}
            @validationErrors={{this.validations.errors.hours}}
          />
        </EditableField>
      {{else}}
        {{@session.ilmSession.hours}}
      {{/if}}
    </span>
  </div>
  {{#unless @session.hasPostrequisite}}
    <SessionOverviewIlmDuedate
      @ilmSession={{this.ilmSession}}
      @editable={{@editable}}
      class="block"
    />
  {{/unless}}
{{/if}}