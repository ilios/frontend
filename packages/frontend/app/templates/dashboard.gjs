import pageTitle from 'ember-page-title/helpers/page-title';
import t from 'ember-intl/helpers/t';
import DashboardLoading from 'frontend/components/dashboard-loading';
<template>
  {{pageTitle (t "general.dashboard")}}
  <div class="ilios-dashboard" data-test-dashboard>
    {{outlet}}
  </div>
  <DashboardLoading />
</template>
