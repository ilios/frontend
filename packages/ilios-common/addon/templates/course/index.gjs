import Sessions from 'ilios-common/components/course/sessions';
import set from 'ember-set-helper/helpers/set';
<template>
  <Sessions
    @course={{@controller.model}}
    @canCreateSession={{@controller.canCreateSession}}
    @canUpdateCourse={{@controller.canUpdateCourse}}
    @sortBy={{@controller.sortBy}}
    @setSortBy={{set @controller "sortSessionsBy"}}
    @filterBy={{@controller.filterSessionsBy}}
    @setFilterBy={{set @controller "filterSessionsBy"}}
    @expandAllSessions={{@controller.expandAllSessions}}
    @setExpandAllSessions={{set @controller "expandAllSessions"}}
  />
</template>
