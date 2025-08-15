import pageTitle from 'ember-page-title/helpers/page-title';
import t from 'ember-intl/helpers/t';
import BackToAdminDashboard from 'frontend/components/back-to-admin-dashboard';
import IliosUsers from 'frontend/components/ilios-users';
import set from 'ember-set-helper/helpers/set';
<template>
  {{pageTitle (t "general.admin") " | " (t "general.users") prepend=false}}
  <BackToAdminDashboard />
  <IliosUsers
    @sortBy={{@controller.sortBy}}
    @setSortBy={{set @controller "sortBy"}}
    @offset={{@controller.offset}}
    @setOffset={{set @controller "offset"}}
    @limit={{@controller.limit}}
    @setLimit={{set @controller "limit"}}
    @query={{@controller.query}}
    @setQuery={{set @controller "query"}}
    @canCreate={{@model.canCreate}}
    @showNewUserForm={{@controller.showNewUserForm}}
    @setShowNewUserForm={{set @controller "showNewUserForm"}}
    @showBulkNewUserForm={{@controller.showBulkNewUserForm}}
    @setShowBulkNewUserForm={{set @controller "showBulkNewUserForm"}}
    @searchTerms={{@controller.searchTerms}}
    @setSearchTerms={{set @controller "searchTerms"}}
    @transitionToUser={{@controller.transitionToUser}}
  />
</template>
