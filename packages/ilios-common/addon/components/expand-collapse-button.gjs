import { on } from '@ember/modifier';
import FaIcon from 'ilios-common/components/fa-icon';
<template>
  <div class="expand-collapse-button" data-test-expand-collapse-button ...attributes>
    {{#if @value}}
      <button
        class="collapse-button"
        type="button"
        {{on "click" @action}}
        aria-label={{@collapseButtonLabel}}
      >
        <FaIcon @icon="minus" />
      </button>
    {{else}}
      <button
        class="expand-button"
        type="button"
        {{on "click" @action}}
        aria-label={{@expandButtonLabel}}
      >
        <FaIcon @icon="plus" />
      </button>
    {{/if}}
  </div>
</template>
