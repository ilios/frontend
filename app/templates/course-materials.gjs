import { LinkTo } from '@ember/routing';
import t from 'ember-intl/helpers/t';
import SummaryHeader from 'ilios-common/components/course/summary-header';
import Materials from 'ilios-common/components/course/materials';
import { or } from 'ember-truth-helpers';
import set from 'ember-set-helper/helpers/set';
<template>
  <div class="backtolink">
    <LinkTo @route="course" @model={{@model}}>
      {{t "general.backToCourse"}}
    </LinkTo>
  </div>
  <SummaryHeader @course={{@model}} />
  <Materials
    @course={{@model}}
    @courseSort={{or @controller.courseSort "title"}}
    @sessionSort={{or @controller.sessionSort "title"}}
    @onCourseSort={{set @controller "courseSort"}}
    @onSessionSort={{set @controller "sessionSort"}}
  />
</template>
