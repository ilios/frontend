import t from 'ember-intl/helpers/t';
import IliosCalendarMultidayEvent from 'ilios-common/components/ilios-calendar-multiday-event';
<template>
  {{#if @events.length}}
    <div class="ilios-calendar-multiday-events" data-test-ilios-calendar-multiday-events>
      <h3 class="title font-size-medium" data-test-title>
        {{t "general.multidayEvents"}}
      </h3>
      <ul>
        {{#each @events as |event|}}
          <IliosCalendarMultidayEvent
            @isEventSelectable={{@areEventsSelectable}}
            @selectEvent={{@selectEvent}}
            @event={{event}}
          />
        {{/each}}
      </ul>
    </div>
  {{/if}}
</template>
