import { LinkTo } from '@ember/routing';
import t from 'ember-intl/helpers/t';
import set from 'ember-set-helper/helpers/set';
import { or } from 'ember-truth-helpers';

import Materials from '../components/course/materials';
import SummaryHeader from '../components/course/summary-header';
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
