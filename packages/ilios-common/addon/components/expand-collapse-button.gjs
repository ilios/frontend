import { on } from '@ember/modifier';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
<template>
  <div class="expand-collapse-button" data-test-expand-collapse-button ...attributes>
    {{#if @value}}
      <button
        class="collapse-button"
        type="button"
        {{on "click" @action}}
        aria-label={{@collapseButtonLabel}}
      >
        <FaIcon @icon={{faMinus}} />
      </button>
    {{else}}
      <button
        class="expand-button"
        type="button"
        {{on "click" @action}}
        aria-label={{@expandButtonLabel}}
      >
        <FaIcon @icon={{faPlus}} />
      </button>
    {{/if}}
  </div>
</template>
