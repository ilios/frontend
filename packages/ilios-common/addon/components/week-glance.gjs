import { service } from '@ember/service';
import Component from '@glimmer/component';
import { isNone } from '@ember/utils';
import { DateTime } from 'luxon';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import scrollIntoView from 'ilios-common/modifiers/scroll-into-view';
import { gt, notEq } from 'ember-truth-helpers';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';
import optional from 'ilios-common/helpers/optional';
import t from 'ember-intl/helpers/t';
import FaIcon from 'ilios-common/components/fa-icon';
import WeekGlanceEvent from 'ilios-common/components/week-glance-event';
import formatDate from 'ember-intl/helpers/format-date';

export default class WeeklyGlance extends Component {
  @service userEvents;
  @service intl;
  @service localeDays;

  @cached
  get weekEventsData() {
    return new TrackedAsyncData(
      this.userEvents.getEvents(
        this.midnightAtTheStartOfTheWeekDateTime.toUnixInteger(),
        this.midnightAtTheEndOfTheWeekDateTime.toUnixInteger(),
      ),
    );
  }

  get weekEvents() {
    return this.weekEventsData.isResolved ? this.weekEventsData.value : null;
  }

  get eventsLoaded() {
    return !isNone(this.weekEvents);
  }

  get thursdayOfTheWeek() {
    const thursday = DateTime.fromObject({
      weekYear: this.args.year,
      weekNumber: this.args.week,
      weekday: 4,
      hour: 0,
      minute: 0,
      second: 0,
    });

    if (!thursday.isValid) {
      console.error('Invalid date', thursday.invalidReason, this.args.year, this.args.week);
      return null;
    }
    return thursday.toJSDate();
  }

  get midnightAtTheStartOfTheWeekDateTime() {
    if (!this.thursdayOfTheWeek) {
      return null;
    }
    return DateTime.fromJSDate(this.localeDays.firstDayOfDateWeek(this.thursdayOfTheWeek));
  }

  get midnightAtTheEndOfTheWeekDateTime() {
    if (!this.thursdayOfTheWeek) {
      return null;
    }
    return DateTime.fromJSDate(this.localeDays.lastDayOfDateWeek(this.thursdayOfTheWeek));
  }

  get publishedWeekEvents() {
    if (!this.weekEvents) {
      return [];
    }

    return this.weekEvents.filter((ev) => {
      return !ev.isBlanked && ev.isPublished && !ev.isScheduled;
    });
  }

  get title() {
    if (!this.midnightAtTheStartOfTheWeekDateTime || !this.midnightAtTheEndOfTheWeekDateTime) {
      return '';
    }

    const from =
      this.intl.formatDate(this.midnightAtTheStartOfTheWeekDateTime, { month: 'long' }) +
      ' ' +
      this.midnightAtTheStartOfTheWeekDateTime.toFormat('d');

    let to = this.midnightAtTheEndOfTheWeekDateTime.toFormat('d');

    if (
      !this.midnightAtTheStartOfTheWeekDateTime.hasSame(
        this.midnightAtTheEndOfTheWeekDateTime,
        'month',
      )
    ) {
      to =
        this.intl.formatDate(this.midnightAtTheEndOfTheWeekDateTime, { month: 'long' }) +
        ' ' +
        this.midnightAtTheEndOfTheWeekDateTime.toFormat('d');
      return `${from} - ${to}`;
    }
    return `${from}-${to}`;
  }

  get nonIlmPreWorkEvents() {
    if (!this.publishedWeekEvents) {
      return [];
    }
    return this.publishedWeekEvents.filter((ev) => {
      return ev.postrequisites.length === 0 || !ev.ilmSession;
    });
  }

  get nonPreWorkEventsByDay() {
    // This transforms the list of events
    // into a map that groups events by the same start date.
    const eventsByDate = new Map();
    this.nonIlmPreWorkEvents.forEach((event) => {
      const startDate = DateTime.fromISO(event.startDate);
      const date = startDate.toISODate();
      if (!eventsByDate.has(date)) {
        eventsByDate.set(date, {
          events: [],
          startDate,
        });
      }
      eventsByDate.get(date).events.push(event);
    });
    return eventsByDate.values();
  }

  <template>
    <div
      class="week-glance"
      data-test-week-glance
      {{scrollIntoView disabled=(notEq @week @weekInFocus)}}
    >
      {{#if @collapsible}}
        <button
          type="button"
          class="title collapsible"
          aria-expanded={{if @collapsed "false" "true"}}
          data-test-week-title
          {{on "click" (fn (optional @toggleCollapsed) @collapsed)}}
        >
          {{this.title}}
          {{#if @showFullTitle}}
            {{t "general.weekAtAGlance"}}
          {{/if}}
          <FaIcon @icon={{if @collapsed "caret-right" "caret-down"}} />
        </button>
      {{else}}
        <h2 class="title" role={{if @collapsible "button"}} data-test-week-title>
          {{this.title}}
          {{#if @showFullTitle}}
            {{t "general.weekAtAGlance"}}
          {{/if}}
        </h2>
      {{/if}}
      {{#unless @collapsed}}
        {{#if this.eventsLoaded}}
          {{#if (gt this.nonIlmPreWorkEvents.length 0)}}
            {{#each this.nonPreWorkEventsByDay as |date|}}
              <div class="events-by-date" data-test-events-by-date>
                <h3 class="day long" data-test-day>{{formatDate date.startDate weekday="long"}}</h3>
                <h3 class="day short" data-test-day>{{formatDate
                    date.startDate
                    weekday="short"
                  }}</h3>
                <h3 class="day narrow" data-test-day>{{formatDate
                    date.startDate
                    weekday="narrow"
                  }}</h3>
                <ul>
                  {{#each date.events as |event|}}
                    <WeekGlanceEvent @event={{event}} />
                  {{/each}}
                </ul>
              </div>
            {{/each}}
          {{else}}
            <p>
              {{t "general.none"}}
            </p>
          {{/if}}
        {{else}}
          <p>
            <FaIcon @icon="spinner" @spin={{true}} />
            {{t "general.loadingEvents"}}
          </p>
        {{/if}}
      {{/unless}}
    </div>
  </template>
}
