import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import set from 'ember-set-helper/helpers/set';
import Subject from 'frontend/components/reports/subject';
<template>
  {{pageTitle (t "general.subjectReports")}}
  <Subject
    @report={{@controller.model}}
    @year={{@controller.reportYear}}
    @changeYear={{set @controller "reportYear"}}
  />
</template>
