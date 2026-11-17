import { fn } from '@ember/helper';
import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import set from 'ember-set-helper/helpers/set';
import Curriculum from 'frontend/components/reports/curriculum';
<template>
  {{pageTitle (t "general.curriculumReports")}}
  <Curriculum
    @selectedCourseIds={{@controller.selectedCourseIds}}
    @setSelectedCourseIds={{@controller.setSelectedCourseIds}}
    @expandedYears={{@controller.expandedYears}}
    @setExpandedYears={{@controller.setExpandedYears}}
    @report={{@controller.report}}
    @setReport={{set @controller "report"}}
    @schools={{@model}}
    @run={{fn (set @controller "run") true}}
    @stop={{fn (set @controller "run") false}}
    @showReportResults={{@controller.run}}
    @titleFilter={{@controller.titleFilter}}
    @changeTitleFilter={{set @controller "titleFilter"}}
  />
</template>
