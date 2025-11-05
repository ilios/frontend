import pageTitle from 'ember-page-title/helpers/page-title';
import t from 'ember-intl/helpers/t';
<template>
  {{pageTitle (t "general.dashboard")}}
  <div class="ilios-dashboard" data-test-dashboard>
    {{outlet}}
  </div>
</template>
