import BackLink from '../components/back-link';
import SingleEvent from '../components/single-event';
<template>
  {{#if @controller.showBackLink}}
    <BackLink />
  {{/if}}
  <SingleEvent @event={{@controller.model}} />
</template>
