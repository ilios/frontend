import pageTitle from 'ember-page-title/helpers/page-title';
import t from 'ember-intl/helpers/t';
import ManageUsersSummary from 'frontend/components/manage-users-summary';
import gt from 'ember-truth-helpers/helpers/gt';
import PendingUpdatesSummary from 'frontend/components/pending-updates-summary';
import UnassignedStudentsSummary from 'frontend/components/unassigned-students-summary';
<template>
  {{pageTitle (t "general.admin")}}
  <div class="admin-dashboard admin-block">
    <ManageUsersSummary @canCreate={{@model.canCreate}} />
    {{#if (gt @model.schoolsWithUpdateUserPermission.length 0)}}
      <PendingUpdatesSummary @schools={{@model.schoolsWithUpdateUserPermission}} />
      <UnassignedStudentsSummary @schools={{@model.schoolsWithUpdateUserPermission}} />
    {{/if}}
  </div>
</template>
