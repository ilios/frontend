import { LinkTo } from '@ember/routing';
import t from 'ember-intl/helpers/t';
import Header from 'frontend/components/program/header';
import Overview from 'frontend/components/program/overview';
import LeadershipExpanded from 'ilios-common/components/leadership-expanded';
import { fn } from '@ember/helper';
import LeadershipCollapsed from 'ilios-common/components/leadership-collapsed';
import hasManyLength from 'ilios-common/helpers/has-many-length';
<template>
  <section class="program" data-test-program-details ...attributes>
    <div class="backtolink">
      <LinkTo @route="programs" data-test-back-link>
        {{t "general.backToPrograms"}}
      </LinkTo>
    </div>
    <Header @program={{@program}} @canUpdate={{@canUpdate}} />
    <Overview @program={{@program}} @canUpdate={{@canUpdate}} />
    {{#if @leadershipDetails}}
      <LeadershipExpanded
        @model={{@program}}
        @editable={{@canUpdate}}
        @collapse={{fn @setLeadershipDetails false}}
        @expand={{fn @setLeadershipDetails true}}
        @isManaging={{@manageLeadership}}
        @setIsManaging={{@setManageLeadership}}
      />
    {{else}}
      <LeadershipCollapsed
        @showAdministrators={{false}}
        @showDirectors={{true}}
        @directorsCount={{hasManyLength @program "directors"}}
        @expand={{fn @setLeadershipDetails true}}
      />
    {{/if}}
  </section>
</template>
