import { LinkTo } from '@ember/routing';
import t from 'ember-intl/helpers/t';
import PublishAllSessions from 'ilios-common/components/publish-all-sessions';
<template>
  <section class="publishall main-section">
    <LinkTo @route="course" @model={{@model}} data-test-back-to-course>
      {{t "general.backToTitle" title=@model.title}}
    </LinkTo>
    <PublishAllSessions @course={{@model}} @saved={{@controller.returnToList}} />
  </section>
</template>
