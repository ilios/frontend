import pageTitle from 'ember-page-title/helpers/page-title';
import t from 'ember-intl/helpers/t';
import Root from 'frontend/components/instructor-group/root';
import set from 'ember-set-helper/helpers/set';
<template>
  {{pageTitle (t "general.instructorGroups")}}
  <Root
    @instructorGroup={{@model}}
    @canUpdate={{@controller.canUpdate}}
    @showCourseAssociations={{@controller.showCourseAssociations}}
    @setShowCourseAssociations={{set @controller "showCourseAssociations"}}
  />
</template>
