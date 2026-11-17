import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import set from 'ember-set-helper/helpers/set';
import Root from 'frontend/components/assign-students/root';
import BackToAdminDashboard from 'frontend/components/back-to-admin-dashboard';
<template>
  {{pageTitle (t "general.admin") " | " (t "general.unassignedStudentsSummaryTitle")}}
  <BackToAdminDashboard />
  <Root
    @model={{@controller.model}}
    @query={{@controller.query}}
    @schoolId={{@controller.schoolId}}
    @setSchoolId={{set @controller "schoolId"}}
    @setQuery={{set @controller "query"}}
  />
</template>
