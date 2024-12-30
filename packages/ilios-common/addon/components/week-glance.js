import { service } from '@ember/service';
import Component from '@glimmer/component';
import { isNone } from '@ember/utils';
import { DateTime } from 'luxon';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';

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
}
