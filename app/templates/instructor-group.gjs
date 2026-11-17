import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import set from 'ember-set-helper/helpers/set';
import Root from 'frontend/components/instructor-group/root';
<template>
  {{pageTitle (t "general.instructorGroups")}}
  <Root
    @instructorGroup={{@model}}
    @canUpdate={{@controller.canUpdate}}
    @showCourseAssociations={{@controller.showCourseAssociations}}
    @setShowCourseAssociations={{set @controller "showCourseAssociations"}}
  />
</template>
