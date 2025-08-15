import pageTitle from 'ember-page-title/helpers/page-title';
import t from 'ember-intl/helpers/t';
import { LinkTo } from '@ember/routing';
<template>
  {{pageTitle (t "general.curriculumInventoryReports")}}
  <div class="backtolink">
    <LinkTo @route="curriculum-inventory-reports">
      {{t "general.backToReports"}}
    </LinkTo>
  </div>
  {{outlet}}
</template>
