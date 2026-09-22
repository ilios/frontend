import BackLink from 'ilios-common/components/back-link';
import SingleEvent from 'ilios-common/components/single-event';
<template>
  {{#if @controller.showBackLink}}
    <BackLink />
  {{/if}}
  <SingleEvent @event={{@controller.model}} />
</template>
