import { fn } from '@ember/helper';
import { LinkTo } from '@ember/routing';
import t from 'ember-intl/helpers/t';
import { pageTitle } from 'ember-page-title';

import hasManyLength from '../../helpers/has-many-length';
import LeadershipCollapsed from '../leadership-collapsed';
import LeadershipExpanded from '../leadership-expanded';
import Header from './header';
import Overview from './overview';
<template>
  {{pageTitle " | " @program.title prepend=false}}

  <section class="program main-section" data-test-program-details ...attributes>
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
