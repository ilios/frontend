import ReportDetails from 'frontend/components/curriculum-inventory/report-details';
import set from 'ember-set-helper/helpers/set';
import ReportRollover from 'frontend/components/curriculum-inventory/report-rollover';
<template>
  <ReportDetails
    @report={{@model}}
    @canUpdate={{@controller.canUpdate}}
    @leadershipDetails={{@controller.leadershipDetails}}
    @setLeadershipDetails={{set @controller "leadershipDetails"}}
    @manageLeadership={{@controller.manageLeadership}}
    @setManageLeadership={{set @controller "manageLeadership"}}
    @setIsFinalized={{set @controller "isFinalized"}}
  />
  <ReportRollover @report={{@model}} @visit={{@controller.loadReport}} />
</template>
