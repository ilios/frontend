import { LinkTo } from '@ember/routing';
import t from 'ember-intl/helpers/t';
<template>
  <div class="reports-switcher" data-test-reports-switcher>
    <LinkTo
      @route="reports.subjects"
      @current-when="reports.subjects reports.subject"
      class="font-size-medium"
      data-test-subject
    >
      {{t "general.subjectReports"}}
    </LinkTo>
    <LinkTo @route="reports.curriculum" class="font-size-medium" data-test-curriculum>
      {{t "general.curriculumReports"}}
    </LinkTo>
  </div>
</template>
