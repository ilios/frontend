import eq from 'ember-truth-helpers/helpers/eq';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import { faCheck, faSpinner } from '@fortawesome/free-solid-svg-icons';
<template>
  <button type="button" disabled={{@isSaving}} ...attributes>
    {{#if @isSaving}}
      {{#if (eq @saveProgressPercent 100)}}
        <FaIcon @icon={{faCheck}} />
      {{else}}
        <FaIcon @icon={{faSpinner}} @spin={{true}} />
      {{/if}}
      {{#if @saveProgressPercent}}
        {{@saveProgressPercent}}%
      {{/if}}
    {{else}}
      {{yield}}
    {{/if}}
  </button>
</template>
