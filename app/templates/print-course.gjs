import { LinkTo } from '@ember/routing';
import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import { and } from 'ember-truth-helpers';

import PrintCourse from '../components/print-course';
<template>
  {{pageTitle (t "general.courses") " | " @model.title " (" (t "general.printSummary") ")"}}
  <div class="backtolink">
    <LinkTo @route="course" @model={{@model}}>
      {{t "general.backToCourse"}}
    </LinkTo>
  </div>
  <PrintCourse
    @course={{@model}}
    @includeUnpublishedSessions={{and @controller.unpublished @controller.canViewUnpublished}}
  />
</template>
