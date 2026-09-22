import { eq } from 'ember-truth-helpers';
import LoadingSpinner from 'ilios-common/components/loading-spinner';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
<template>
  <button type="button" disabled={{@isSaving}} ...attributes>
    {{#if @isSaving}}
      {{#if (eq @saveProgressPercent 100)}}
        <FaIcon @icon={{faCheck}} />
      {{else}}
        <LoadingSpinner />
      {{/if}}
      {{#if @saveProgressPercent}}
        {{@saveProgressPercent}}%
      {{/if}}
    {{else}}
      {{yield}}
    {{/if}}
  </button>
</template>
