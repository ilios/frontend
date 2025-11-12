import { LinkTo } from '@ember/routing';
import t from 'ember-intl/helpers/t';
<template>
  <div class="back-to-admin-dashboard main-section" data-test-back-to-admin-dashboard ...attributes>
    <LinkTo @route="admin-dashboard">
      {{t "general.backToAdminDashboard"}}
    </LinkTo>
  </div>
</template>
