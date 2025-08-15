import pageTitle from 'ember-page-title/helpers/page-title';
import t from 'ember-intl/helpers/t';
import Reports from 'frontend/components/curriculum-inventory/reports';
<template>
  {{pageTitle (t "general.curriculumInventoryReports")}}
  <Reports
    @programId={{@controller.programId}}
    @schoolId={{@controller.schoolId}}
    @schools={{@model}}
    @sortReportsBy={{@controller.sortReportsBy}}
    @setSortBy={{@controller.setSortBy}}
    @setSchoolId={{@controller.setSchoolId}}
    @setProgramId={{@controller.setProgramId}}
  />
</template>
