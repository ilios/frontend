import pageTitle from 'ember-page-title/helpers/page-title';
import t from 'ember-intl/helpers/t';
import SubjectsList from 'frontend/components/reports/subjects-list';
import set from 'ember-set-helper/helpers/set';
import perform from 'ember-concurrency/helpers/perform';
<template>
  {{pageTitle (t "general.subjectReports")}}
  <SubjectsList
    @sortReportsBy={{@controller.sortReportsBy}}
    @setSortReportsBy={{set @controller "sortReportsBy"}}
    @titleFilter={{@controller.titleFilter}}
    @changeTitleFilter={{perform @controller.changeTitleFilter}}
    @showNewReportForm={{@controller.showNewReportForm}}
    @title={{@controller.title}}
    @setTitle={{set @controller "title"}}
    @selectedSchoolId={{@controller.selectedSchoolId}}
    @setSelectedSchoolId={{set @controller "selectedSchoolId"}}
    @selectedSubject={{@controller.selectedSubject}}
    @setSelectedSubject={{set @controller "selectedSubject"}}
    @selectedPrepositionalObject={{@controller.selectedPrepositionalObject}}
    @setSelectedPrepositionalObject={{set @controller "selectedPrepositionalObject"}}
    @selectedPrepositionalObjectId={{@controller.selectedPrepositionalObjectId}}
    @setSelectedPrepositionalObjectId={{set @controller "selectedPrepositionalObjectId"}}
    @toggleNewReportForm={{@controller.toggleNewReportForm}}
    @runningSubjectReport={{@controller.runningSubjectReport}}
    @setRunningSubjectReport={{@controller.setRunningSubjectReport}}
  />
</template>
