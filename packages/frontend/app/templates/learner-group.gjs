import pageTitle from 'ember-page-title/helpers/page-title';
import t from 'ember-intl/helpers/t';
import Root from 'frontend/components/learner-group/root';
import set from 'ember-set-helper/helpers/set';
import toggle from 'ilios-common/helpers/toggle';
<template>
  {{pageTitle (t "general.learnerGroups")}}
  <Root
    @setIsEditing={{set @controller "isEditing"}}
    @canCreate={{@controller.canCreate}}
    @canUpdate={{@controller.canUpdate}}
    @canDelete={{@controller.canDelete}}
    @setIsBulkAssigning={{set @controller "isBulkAssigning"}}
    @sortUsersBy={{@controller.sortUsersBy}}
    @setSortUsersBy={{set @controller "sortUsersBy"}}
    @learnerGroup={{@model}}
    @isEditing={{@controller.isEditing}}
    @isBulkAssigning={{@controller.isBulkAssigning}}
    @showCourseAssociations={{@controller.showCourseAssociations}}
    @setShowCourseAssociations={{set @controller "showCourseAssociations"}}
    @showCalendar={{@controller.showCalendar}}
    @setShowCalendar={{toggle "showCalendar" @controller}}
  />
</template>
