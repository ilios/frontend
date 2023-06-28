import { service } from '@ember/service';
import Component from '@glimmer/component';
import { isNone } from '@ember/utils';
import { DateTime } from 'luxon';
import scrollIntoView from 'scroll-into-view';
import { action } from '@ember/object';
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
        this.midnightAtTheEndOfTheWeekDateTime.toUnixInteger()
      )
    );
  }

  get weekEvents() {
    return this.weekEventsData.isResolved ? this.weekEventsData.value : null;
  }

  get eventsLoaded() {
    return !isNone(this.weekEvents);
  }

  get thursdayOfTheWeek() {
    return DateTime.fromObject({
      weekYear: this.args.year,
      weekNumber: this.args.week,
      weekday: 4,
      hour: 0,
      minute: 0,
      second: 0,
    }).toJSDate();
  }

  get midnightAtTheStartOfTheWeekDateTime() {
    return DateTime.fromJSDate(this.localeDays.firstDayOfDateWeek(this.thursdayOfTheWeek));
  }

  get midnightAtTheEndOfTheWeekDateTime() {
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

  @action
  scrollOnLoad(element) {
    if (this.args.week === this.args.weekInFocus) {
      scrollIntoView(element);
    }
  }

  get title() {
    if (!this.midnightAtTheStartOfTheWeekDateTime || !this.midnightAtTheEndOfTheWeekDateTime) {
      return '';
    }

    const from = this.midnightAtTheStartOfTheWeekDateTime.toFormat('MMMM d');
    let to = this.midnightAtTheEndOfTheWeekDateTime.toFormat('d');
    if (
      !this.midnightAtTheStartOfTheWeekDateTime.hasSame(
        this.midnightAtTheEndOfTheWeekDateTime,
        'month'
      )
    ) {
      to = this.midnightAtTheEndOfTheWeekDateTime.toFormat('MMMM d');
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
