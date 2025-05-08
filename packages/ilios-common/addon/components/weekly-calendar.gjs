import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { sortBy } from 'ilios-common/utils/array-helpers';
import { modifier } from 'ember-modifier';
import { DateTime } from 'luxon';
import FaIcon from 'ilios-common/components/fa-icon';
import t from 'ember-intl/helpers/t';
import formatDate from 'ember-intl/helpers/format-date';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';
import WeeklyCalendarEvent from 'ilios-common/components/weekly-calendar-event';

export default class WeeklyCalendarComponent extends Component {
  @service intl;
  @service localeDays;

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

  get firstDayOfWeek() {
    return this.localeDays.firstDayOfDateWeek(this.args.date);
  }

  get lastDayOfWeek() {
    return this.localeDays.lastDayOfDateWeek(this.args.date);
  }

  get week() {
    return [...Array(7).keys()].map((i) => {
      const date = DateTime.fromJSDate(this.firstDayOfWeek).plus({ days: i });
      return {
        date: date.toJSDate(),
        dayOfWeek: i + 1,
        fullName: date.toFormat('dddd LL'),
      };
    });
  }

  get earliestHour() {
    if (!this.args.events) {
      return null;
    }

    return this.sortedEvents.reduce((earliestHour, event) => {
      const hour = Number(DateTime.fromISO(event.startDate).toFormat('HH'));
      return hour < earliestHour ? hour : earliestHour;
    }, 24);
  }

  get sortedEvents() {
    if (!this.args.events) {
      return [];
    }

    return sortBy(this.args.events, ['startDate', 'endDate', 'name']);
  }

  get days() {
    return this.week.map((day) => {
      const dt = DateTime.fromJSDate(day.date);
      day.events = this.sortedEvents.filter((e) =>
        dt.hasSame(DateTime.fromISO(e.startDate), 'day'),
      );
      return day;
    });
  }

  get hours() {
    return [...Array(24).keys()].map((i) => {
      const time = DateTime.fromJSDate(this.firstDayOfWeek).set({ hour: i });
      return {
        hour: time.toFormat('H'),
        longName: this.intl.formatDate(time, { hour: 'numeric', minute: 'numeric' }),
        shortName: this.intl.formatDate(time, { hour: 'numeric' }),
      };
    });
  }

  @action
  selectEvent(event) {
    if (event.isMulti) {
      this.args.changeToDayView(event.startDate);
    } else {
      this.args.selectEvent(event);
    }
  }

  @action
  changeToDayView(date) {
    this.args.changeToDayView(DateTime.fromJSDate(date).toFormat('yyyy-MM-dd'));
  }
  <template>
    <section
      class="weekly-calendar"
      aria-busy={{if @isLoadingEvents "true" "false"}}
      aria-live="polite"
      data-test-weekly-calendar
    >
      <h2 class="week-of-year" data-test-week-of-year>
        {{#if @isLoadingEvents}}
          <FaIcon @icon="spinner" @spin={{true}} />
          {{t "general.loadingEvents"}}
          ...
        {{else}}
          <span class="short" data-test-short>
            {{formatDate this.firstDayOfWeek month="2-digit" day="2-digit"}}
            &mdash;
            {{formatDate this.lastDayOfWeek month="2-digit" day="2-digit"}}
            {{formatDate this.lastDayOfWeek year="numeric"}}
          </span>
          <span class="long" data-test-long>{{t
              "general.weekOf"
              date=(formatDate this.firstDayOfWeek month="long" day="numeric" year="numeric")
            }}</span>
        {{/if}}
      </h2>
      <div
        class="days"
        tabindex="0"
        id="weekly-calendar-days"
        {{this.scrollView this.earliestHour}}
      >
        <div class="hours">
          {{#each this.hours as |hour|}}
            <span aria-hidden="true" class="hour hour-{{hour.hour}}">
              <span class="long">{{hour.longName}}</span>
              <span class="short">{{hour.shortName}}</span>
            </span>
          {{/each}}
        </div>
        {{#each this.days as |day|}}
          <div class="events day-{{day.dayOfWeek}}" data-test-events-day>
            <h3 class="day-name" data-test-day-name>
              <button type="button" {{on "click" (fn this.changeToDayView day.date)}}>
                {{formatDate day.date weekday="long"}}
              </button>
            </h3>
            {{#each day.events as |event|}}
              <WeeklyCalendarEvent
                @event={{event}}
                @day={{day.dayOfWeek}}
                @allDayEvents={{day.events}}
                @selectEvent={{fn this.selectEvent event}}
              />
            {{else}}
              <span class="no-events" data-test-no-events>{{t "general.noEvents"}}</span>
            {{/each}}
          </div>
        {{/each}}
        {{#each this.hours as |hour|}}
          <div class="hour-border hour-{{hour.hour}}" aria-hidden="true"></div>
          <div class="half-hour-border half-hour-{{hour.hour}}" aria-hidden="true"></div>
        {{/each}}
      </div>
      <div class="day-headings" aria-hidden="true" data-test-day-headings>
        {{#each this.week as |day|}}
          <div class="day-heading day-{{day.dayOfWeek}}">
            <button
              type="button"
              {{on "click" (fn this.changeToDayView day.date)}}
              tabindex="-1"
              data-test-day
              aria-label={{day.longName}}
            >
              <span class="long">{{formatDate day.date weekday="long"}}</span>
              <span class="short">{{formatDate day.date weekday="short"}}</span>
              <span class="long">{{formatDate day.date month="short" day="numeric"}}</span>
              <span class="short">{{formatDate day.date day="numeric"}}</span>
            </button>
          </div>
        {{/each}}
      </div>
    </section>
  </template>
}
