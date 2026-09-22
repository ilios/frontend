import pageTitle from 'ember-page-title/helpers/page-title';
import t from 'ember-intl/helpers/t';
import NotFound from 'ilios-common/components/not-found';
import { on } from '@ember/modifier';
<template>
  {{pageTitle (t "general.error")}}
  <div class="full-screen-error main-section">
    {{#if @controller.isA404}}
      <NotFound />
    {{else}}
      <h2>
        {{t "general.finalErrorDisplayMessage"}}
      </h2>
      <p class="clear-errors">
        <button type="button" {{on "click" @controller.forceRefresh}}>
          {{t "general.refreshTheBrowser"}}
        </button>
      </p>
    {{/if}}
  </div>
</template>
