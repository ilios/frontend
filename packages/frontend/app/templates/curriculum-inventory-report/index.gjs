import pageTitle from 'ember-page-title/helpers/page-title';
import ReportDetails from 'frontend/components/curriculum-inventory/report-details';
import set from 'ember-set-helper/helpers/set';
import SequenceBlockList from 'frontend/components/curriculum-inventory/sequence-block-list';
<template>
  {{pageTitle " | " @model.name prepend=false}}
  <ReportDetails
    @report={{@model}}
    @canUpdate={{@controller.canUpdate}}
    @leadershipDetails={{@controller.leadershipDetails}}
    @setLeadershipDetails={{set @controller "leadershipDetails"}}
    @manageLeadership={{@controller.manageLeadership}}
    @setManageLeadership={{set @controller "manageLeadership"}}
    @setIsFinalized={{set @controller "isFinalized"}}
  />
  <SequenceBlockList
    @report={{@model}}
    @sequenceBlocks={{@controller.topLevelSequenceBlocks}}
    @canUpdate={{@controller.canUpdate}}
    @remove={{@controller.removeSequenceBlock}}
  />
</template>
