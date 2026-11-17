import set from 'ember-set-helper/helpers/set';

import BackLink from '../components/back-link';
import WeeklyEvents from '../components/weekly-events';
<template>
  {{#if @controller.showBackLink}}
    <BackLink />
  {{/if}}
  <WeeklyEvents
    @year={{@controller.year}}
    @expandedWeeks={{@controller.expandedWeeks}}
    @weekInFocus={{@controller.week}}
    @setYear={{set @controller "year"}}
    @toggleOpenWeek={{@controller.toggleOpenWeek}}
  />
</template>
