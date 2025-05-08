import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { sortBy } from 'ilios-common/utils/array-helpers';
import { DateTime } from 'luxon';

export default class MonthlyCalendarComponent extends Component {
  @service intl;
  @service localeDays;

  get sortedEvents() {
    if (!this.args.events) {
      return [];
    }

    return sortBy(this.args.events, ['startDate', 'endDate', 'name']);
  }

  get firstDayOfMonth() {
    return DateTime.fromJSDate(this.args.date).startOf('month').toJSDate();
  }

  get firstDayOfFirstWeek() {
    return this.localeDays.firstDayOfDateWeek(this.firstDayOfMonth);
  }

  get days() {
    const fdom = DateTime.fromJSDate(this.firstDayOfMonth);
    const fdow = DateTime.fromJSDate(this.firstDayOfFirstWeek);
    const startsOnSunday = fdow.weekday === 7;
    const offset = fdom.diff(fdow, 'days').days;

    return [...Array(fdom.daysInMonth).keys()].map((i) => {
      const date = fdom.plus({ days: i });
      return {
        date: date.toJSDate(),
        dayOfMonth: i + 1,
        dayOfWeek: startsOnSunday ? date.plus({ day: 1 }).weekday : date.weekday,
        weekOfMonth: Math.ceil((date.day + offset) / 7),
        name: this.intl.formatDate(date.toJSDate(), {
          weekday: 'long',
          year: 'numeric',
          month: 'numeric',
          day: 'numeric',
        }),
        events: this.sortedEvents.filter((e) => date.hasSame(DateTime.fromISO(e.startDate), 'day')),
      };
    });
  }

  get dayNames() {
    return [...Array(7).keys()].map((i) => {
      const date = DateTime.fromJSDate(this.firstDayOfFirstWeek).plus({ days: i }).toJSDate();
      return {
        day: i + 1,
        longName: this.intl.formatDate(date, { weekday: 'long' }),
        shortName: this.intl.formatDate(date, { weekday: 'short' }),
      };
    });
  }

  @action
  changeToDayView(date) {
    this.args.changeToDayView(DateTime.fromJSDate(date).toFormat('yyyy-MM-dd'));
  }
}

<section
  class="monthly-calendar"
  aria-busy={{if @isLoadingEvents "true" "false"}}
  aria-live="polite"
  data-test-monthly-calendar
>
  <h2 class="month-year" data-test-month-year>
    {{#if @isLoadingEvents}}
      <FaIcon @icon="spinner" @spin={{true}} />
      {{t "general.loadingEvents"}}
      ...
    {{else}}
      {{format-date this.firstDayOfMonth month="long" year="numeric"}}
    {{/if}}
  </h2>
  <div class="calendar">
    {{#each this.days as |day|}}
      <div class="day week-{{day.weekOfMonth}} day-{{day.dayOfWeek}}" data-test-day>
        <h3 class="day-number" aria-label={{day.name}} data-test-number>
          <button
            type="button"
            aria-label={{concat (t "general.view") " " day.name}}
            {{on "click" (fn this.changeToDayView day.date)}}
            data-test-day-button={{day.dayOfMonth}}
          >
            {{day.dayOfMonth}}
          </button>
        </h3>
        {{#each (slice 0 2 day.events) as |event|}}
          {{#if event.isMulti}}
            <IliosCalendarEventMonth
              @event={{event}}
              @selectEvent={{fn @changeToDayView event.startDate}}
            />
          {{else}}
            <IliosCalendarEventMonth @event={{event}} @selectEvent={{fn @selectEvent event}} />
          {{/if}}
        {{else}}
          <span class="no-events" data-test-no-events>{{t "general.noEvents"}}</span>
        {{/each}}
        {{#if (gt day.events.length 2)}}
          <button
            type="button"
            class="month-more-events"
            aria-label={{t "general.showMore"}}
            {{on "click" (fn this.changeToDayView day.date)}}
            data-test-show-more-button
          >
            <FaIcon @icon="ellipsis" />
            <span class="text">
              {{t "general.showMore"}}
            </span>
            <FaIcon @icon="angles-down" />
          </button>
        {{/if}}
      </div>
    {{/each}}

    {{#each this.dayNames as |day|}}
      <span class="day-heading day-{{day.day}}" aria-hidden="true">
        <span class="long-name">{{day.longName}}</span>
        <span class="short-name">{{day.shortName}}</span>
      </span>
    {{/each}}
  </div>
</section>