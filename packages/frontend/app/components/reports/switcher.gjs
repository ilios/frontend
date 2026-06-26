import { LinkTo } from '@ember/routing';
import t from 'ember-intl/helpers/t';
<template>
  <div class="reports-switcher" data-test-reports-switcher>
    <LinkTo @route="reports.curriculum" @current-when="reports.curriculum" data-test-curriculum>
      {{t "general.curriculumReports"}}
    </LinkTo>
    <LinkTo @route="reports.subjects" data-test-subject>
      {{t "general.subjectReports"}}
    </LinkTo>
  </div>
</template>
