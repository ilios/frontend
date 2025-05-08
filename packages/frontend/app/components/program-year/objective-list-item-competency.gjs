import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import FaIcon from 'ilios-common/components/fa-icon';
<template>
  <div
    class="program-year-objective-list-item-competency grid-item"
    data-test-objective-list-item-competency
  >
    {{#if @isManaging}}
      <button
        type="button"
        class="bigadd"
        {{on "click" @save}}
        disabled={{@isSaving}}
        aria-label={{t "general.save"}}
        data-test-save
      >
        {{#if @isSaving}}
          <FaIcon @icon="spinner" @spin={{true}} />
        {{else}}
          <FaIcon @icon="check" />
        {{/if}}
      </button>
      <button
        type="button"
        class="bigcancel"
        {{on "click" @cancel}}
        aria-label={{t "general.cancel"}}
        data-test-cancel
      >
        <FaIcon @icon="arrow-rotate-left" />
      </button>
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
