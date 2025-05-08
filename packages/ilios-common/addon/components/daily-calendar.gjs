import Component from '@glimmer/component';
import { service } from '@ember/service';
import { sortBy } from 'ilios-common/utils/array-helpers';
import { modifier } from 'ember-modifier';
import { DateTime } from 'luxon';

export default class DailyCalendarComponent extends Component {
  @service intl;

  scrollView = modifier((element, [earliestHour]) => {
    // all of the hour elements are registered in the template as hour-0, hour-1, etc
    let hourElement = element.getElementsByClassName(`hour-6`)[0];

    if (earliestHour < 24 && earliestHour > 2) {
      hourElement = element.getElementsByClassName(`hour-${earliestHour}`)[0];
    }
    const { offsetTop } = hourElement;
    element.scrollTo({
      top: offsetTop,
      behavior: 'instant',
    });
  });

  get earliestHour() {
    if (!this.args.events) {
      return null;
    }

    return this.sortedEvents.reduce((earliestHour, event) => {
      const { hour } = DateTime.fromISO(event.startDate);
      return hour < earliestHour ? hour : earliestHour;
    }, 24);
  }

  get sortedEvents() {
    if (!this.args.events) {
      return [];
    }

    return sortBy(this.args.events, ['startDate', 'endDate', 'name']);
  }

  get hours() {
    const today = DateTime.fromJSDate(this.args.date).startOf('day');
    return [...Array(24).keys()].map((i) => {
      const time = today.set({ hour: i });
      return {
        hour: time.hour,
        longName: this.intl.formatDate(time, { hour: 'numeric', minute: 'numeric' }),
        shortName: this.intl.formatDate(time, { hour: 'numeric' }),
      };
    });
  }
}

<section
  class="daily-calendar"
  aria-busy={{if @isLoadingEvents "true" "false"}}
  aria-live="polite"
  data-test-daily-calendar
>
  <h2 class="day-of-week" data-test-day-of-week>
    {{#if @isLoadingEvents}}
      <FaIcon @icon="spinner" @spin={{true}} />
      {{t "general.loadingEvents"}}
      ...
    {{else}}
      <span class="short" data-test-short>
        {{format-date @date month="2-digit" day="2-digit" year="numeric"}}
      </span>
      <span class="long" data-test-long>{{format-date
          @date
          weekday="long"
          month="long"
          day="numeric"
          year="numeric"
        }}</span>
    {{/if}}
  </h2>

  <div class="day" tabindex="0" id="daily-calendar-events" {{this.scrollView this.earliestHour}}>
    <div class="hours">
      {{#each this.hours as |hour|}}
        <span aria-hidden="true" class="hour hour-{{hour.hour}}">
          <span class="long">{{hour.longName}}</span>
          <span class="short">{{hour.shortName}}</span>
        </span>
      {{/each}}
    </div>
    <div class="events">
      {{#each this.sortedEvents as |event|}}
        <DailyCalendarEvent
          @event={{event}}
          @allDayEvents={{this.sortedEvents}}
          @selectEvent={{fn @selectEvent event}}
        />
      {{else}}
        <span class="no-events" data-test-no-events>{{t "general.noEvents"}}</span>
      {{/each}}
    </div>
    {{#each this.hours as |hour|}}
      <div class="hour-border hour-{{hour.hour}}" aria-hidden="true"></div>
      <div class="half-hour-border half-hour-{{hour.hour}}" aria-hidden="true"></div>
    {{/each}}
  </div>
</section>