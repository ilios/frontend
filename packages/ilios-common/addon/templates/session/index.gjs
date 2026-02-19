import SessionDetails from 'ilios-common/components/session-details';
import set from 'ember-set-helper/helpers/set';
import { fn } from '@ember/helper';
import { not } from 'ember-truth-helpers';
<template>
  <SessionDetails
    @session={{@model}}
    @editable={{@controller.canUpdate}}
    @sessionObjectiveDetails={{@controller.sessionObjectiveDetails}}
    @sessionTaxonomyDetails={{@controller.sessionTaxonomyDetails}}
    @setSessionObjectiveDetails={{set @controller "sessionObjectiveDetails"}}
    @setSessionTaxonomyDetails={{set @controller "sessionTaxonomyDetails"}}
    @showNewOfferingForm={{@controller.addOffering}}
    @toggleShowNewOfferingForm={{fn (set @controller "addOffering") (not @controller.addOffering)}}
    @sessionLeadershipDetails={{@controller.sessionLeadershipDetails}}
    @setSessionLeadershipDetails={{set @controller "sessionLeadershipDetails"}}
    @sessionManageLeadership={{@controller.sessionManageLeadership}}
    @setSessionManageLeadership={{set @controller "sessionManageLeadership"}}
  />
</template>
