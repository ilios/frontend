import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import BigAddCancelButtons from 'ilios-common/components/big-add-cancel-buttons';
<template>
  <div
    class="program-year-objective-list-item-competency grid-item"
    data-test-objective-list-item-competency
  >
    {{#if @isManaging}}
      <BigAddCancelButtons @add={{@save}} @cancel={{@cancel}} @disableSave={{@isSaving}} />
    {{else}}
      {{#if @objective.competency}}
        {{#if @editable}}
          <button
            type="button"
            class="link-button"
            data-test-competency
            data-test-manage
            {{on "click" @manage}}
          >
            {{@objective.competency.title}}
          </button>
        {{else}}
          <span data-test-competency>{{@objective.competency.title}}</span>
        {{/if}}
        {{#if @objective.competency.parent}}
          <span data-test-domain>({{@objective.competency.parent.title}})</span>
        {{/if}}
      {{else if @editable}}
        <button type="button" {{on "click" @manage}} data-test-manage>
          {{t "general.addNew"}}
        </button>
      {{else}}
        {{t "general.none"}}
      {{/if}}
    {{/if}}
  </div>
</template>
