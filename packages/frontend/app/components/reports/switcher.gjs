import { LinkTo } from '@ember/routing';
import t from 'ember-intl/helpers/t';
<template>
  <div class="reports-switcher" data-test-reports-switcher>
    <LinkTo
      @route="reports.subjects"
      @current-when="reports.subjects reports.subject"
      data-test-subject
    >
      {{t "general.subjectReports"}}
    </LinkTo>
    <LinkTo @route="reports.curriculum" data-test-curriculum>
      {{t "general.curriculumReports"}}
    </LinkTo>
  </div>
</template>
