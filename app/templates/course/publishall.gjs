import { LinkTo } from '@ember/routing';
import t from 'ember-intl/helpers/t';
import PublishAllSessions from 'ilios-common/components/publish-all-sessions';
import set from 'ember-set-helper/helpers/set';
<template>
  <section class="publishall main-section">
    <LinkTo @route="course" @model={{@model}} data-test-back-to-course>
      {{t "general.backToTitle" title=@model.title}}
    </LinkTo>
    <PublishAllSessions
      @course={{@model}}
      @saved={{@controller.returnToList}}
      @expandCompleteSessions={{@controller.expandCompleteSessions}}
      @expandIncompleteSessions={{@controller.expandIncompleteSessions}}
      @setExpandCompleteSessions={{set @controller "expandCompleteSessions"}}
      @setExpandIncompleteSessions={{set @controller "expandIncompleteSessions"}}
      @sortIncompleteBy={{@controller.sortIncompleteBy}}
      @setSortIncompleteBy={{set @controller "sortIncompleteBy"}}
      @sortCompleteBy={{@controller.sortCompleteBy}}
      @setSortCompleteBy={{set @controller "sortCompleteBy"}}
      @sortUnpublishedBy={{@controller.sortUnpublishedBy}}
      @setSortUnpublishedBy={{set @controller "sortUnpublishedBy"}}
    />
  </section>
</template>
