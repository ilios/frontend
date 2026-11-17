import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import set from 'ember-set-helper/helpers/set';
import Root from 'frontend/components/program/root';
<template>
  {{pageTitle (t "general.programs")}}
  <Root
    @program={{@model}}
    @canUpdate={{@controller.canUpdate}}
    @leadershipDetails={{@controller.leadershipDetails}}
    @setLeadershipDetails={{set @controller "leadershipDetails"}}
    @manageLeadership={{@controller.manageLeadership}}
    @setManageLeadership={{set @controller "manageLeadership"}}
  />
  {{outlet}}
</template>
