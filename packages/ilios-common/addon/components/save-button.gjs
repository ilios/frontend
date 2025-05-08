import eq from 'ember-truth-helpers/helpers/eq';
import FaIcon from 'ilios-common/components/fa-icon';
<template>
  <button type="button" disabled={{@isSaving}} ...attributes>
    {{#if @isSaving}}
      {{#if (eq @saveProgressPercent 100)}}
        <FaIcon @icon="check" />
      {{else}}
        <FaIcon @icon="spinner" @spin={{true}} />
      {{/if}}
      {{#if @saveProgressPercent}}
        {{@saveProgressPercent}}%
      {{/if}}
    {{else}}
      {{yield}}
    {{/if}}
  </button>
</template>
