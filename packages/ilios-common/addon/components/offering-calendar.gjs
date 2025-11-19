import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { map } from 'rsvp';
import { DateTime } from 'luxon';
import { TrackedAsyncData } from 'ember-async-data';
import t from 'ember-intl/helpers/t';
import ToggleYesno from 'ilios-common/components/toggle-yesno';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { service } from '@ember/service';
import set from 'ember-set-helper/helpers/set';
import not from 'ember-truth-helpers/helpers/not';
import toggle from 'ilios-common/helpers/toggle';
import IliosCalendarWeek from 'ilios-common/components/ilios-calendar-week';
import LoadingSpinner from 'ilios-common/components/loading-spinner';

export default class OfferingCalendar extends Component {
  @tracked showLearnerGroupEvents = true;
  @tracked showSessionEvents = true;
  @tracked learnerGroupEvents = [];
  @tracked sessionEvents = [];
  @tracked currentEvent = null;
  @service schoolEvents;

  @cached
  get calendarEventsData() {
    return new TrackedAsyncData(
      this.loadData(
        this.args.startDate,
        this.args.endDate,
        this.args.learnerGroups,
        this.args.session,
      ),
    );
  }

  async loadData(startDate, endDate, learnerGroups, session) {
    if (!learnerGroups) {
      this.learnerGroupEvents = [];
    } else {
      const data = await map(learnerGroups, async (learnerGroup) => {
        const offerings = await learnerGroup.offerings;
        return await map(offerings, async (offering) => {
          const session = await offering.session;
          const course = await session.course;
          const school = await course.school;
          return this.schoolEvents.createEventFromData(
            {
              startDate: DateTime.fromJSDate(offering.startDate).toISO(),
              endDate: DateTime.fromJSDate(offering.endDate).toISO(),
              calendarStartDate: DateTime.fromJSDate(offering.startDate).toISO(),
              calendarEndDate: DateTime.fromJSDate(offering.endDate).toISO(),
              courseTitle: course.title,
              school: school.id,
              name: session.title,
              offering: offering.id,
              location: offering.location,
              color: '#84c444',
              postrequisites: [],
              prerequisites: [],
            },
            false,
          );
        });
      });

      this.learnerGroupEvents = data.reduce((flattened, obj) => {
        return [...flattened, ...obj];
      }, []);
    }

    if (!session) {
      this.sessionEvents = [];
      this.currentEvent = null;
    } else {
      const offerings = await session.offerings;
      const sessionType = await session.sessionType;
      const course = await session.course;
      const school = await course.school;
      this.sessionEvents = await map(offerings, async (offering) => {
        return this.schoolEvents.createEventFromData(
          {
            startDate: DateTime.fromJSDate(offering.startDate).toISO(),
            endDate: DateTime.fromJSDate(offering.endDate).toISO(),
            calendarStartDate: DateTime.fromJSDate(offering.startDate).toISO(),
            calendarEndDate: DateTime.fromJSDate(offering.endDate).toISO(),
            courseTitle: course.title,
            school: school.id,
            name: session.title,
            offering: offering.id,
            location: offering.location,
            color: '#f6f6f6',
            postrequisites: [],
            prerequisites: [],
          },
          false,
        );
      });

      this.currentEvent = this.schoolEvents.createEventFromData(
        {
          startDate: DateTime.fromJSDate(startDate).toISO(),
          endDate: DateTime.fromJSDate(endDate).toISO(),
          calendarStartDate: DateTime.fromJSDate(startDate).toISO(),
          calendarEndDate: DateTime.fromJSDate(endDate).toISO(),
          courseTitle: course.title,
          school: school.id,
          name: session.title,
          isPublished: session.isPublished,
          offering: 1,
          location: '',
          color: sessionType.calendarColor,
          postrequisites: [],
          prerequisites: [],
        },
        false,
      );
    }
  }

  get calendarEvents() {
    if (!this.currentEvent) {
      return [];
    }

    let events = [];

    if (this.showLearnerGroupEvents) {
      events = [...events, ...this.learnerGroupEvents];
    }
    if (this.showSessionEvents) {
      events = [...events, ...this.sessionEvents];
    }

    const currentEventIdentifier =
      this.currentEvent.name + this.currentEvent.startDate + this.currentEvent.endDate;

    const filteredEvents = events.filter((event) => {
      if (!event) {
        return false;
      }
      const eventIdentifier = event.name + event.startDate + event.endDate;
      return eventIdentifier !== currentEventIdentifier;
    });

    return [...filteredEvents, this.currentEvent];
  }
  <template>
    <div class="offering-calendar">
      {{#if this.calendarEventsData.isResolved}}
        <h2 class="offering-calendar-title">
          {{t "general.calendar"}}
        </h2>
        <p class="offering-calendar-filter-options">
          <span class="filter">
            <ToggleYesno
              @yes={{this.showLearnerGroupEvents}}
              @toggle={{fn (mut this.showLearnerGroupEvents)}}
            />
            <label
              {{on "click" (set this "showLearnerGroupEvents" (not this.showLearnerGroupEvents))}}
            >
              {{t "general.showLearnerGroupEvents"}}
            </label>
          </span>
          <span class="filter">
            <ToggleYesno
              @yes={{this.showSessionEvents}}
              @toggle={{fn (mut this.showSessionEvents)}}
            />
            <label {{on "click" (toggle "showSessionEvents" this)}}>
              {{! template-lint-disable no-triple-curlies }}
              {{{t "general.showSessionEvents" sessionTitle=@session.title}}}
            </label>
          </span>
        </p>
        <div class="ilios-calendar">
          <IliosCalendarWeek
            @calendarEvents={{this.calendarEvents}}
            @date={{@startDate}}
            @areEventsSelectable={{false}}
            @areDaysSelectable={{false}}
          />
        </div>
      {{else}}
        <span class="loading-indicator">
          <LoadingSpinner />
          {{t "general.loadingEvents"}}
          ...
        </span>
      {{/if}}
    </div>
  </template>
}
