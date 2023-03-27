import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { sortBy } from 'ilios-common/utils/array-helpers';
import { DateTime } from 'luxon';
import { deprecate } from '@ember/debug';

export default class MonthlyCalendarComponent extends Component {
  @service intl;
  @service localeDays;

  get date() {
    if (typeof this.args.date === 'string') {
      deprecate(`String passed to MonthlyCalendar @date instead of Date`, false, {
        id: 'common.dates-no-strings',
        for: 'ilios-common',
        until: '72',
        since: '71',
      });
      return DateTime.fromISO(this.args.date).toJSDate();
    }

    return this.args.date;
  }

  get sortedEvents() {
    if (!this.args.events) {
      return [];
    }

    const events = this.args.events.map((event) => {
      if (typeof event.startDate === 'object') {
        deprecate(
          `Object passed to MonothlyCalendar @events.startDate instead of ISO string`,
          false,
          {
            id: 'common.dates-no-dates',
            for: 'ilios-common',
            until: '72',
            since: '71',
          }
        );
        event.startDate = DateTime.fromJSDate(event.startDate).toISO();
      }
      if (typeof event.endDate === 'object') {
        deprecate(
          `Object passed to MonothlyCalendar @events.endDate instead of ISO string`,
          false,
          {
            id: 'common.dates-no-dates',
            for: 'ilios-common',
            until: '72',
            since: '71',
          }
        );
        event.endDate = DateTime.fromJSDate(event.endDate).toISO();
      }

      return event;
    });

    return sortBy(events, ['startDate', 'endDate', 'name']);
  }

  get firstDayOfMonth() {
    return DateTime.fromJSDate(this.date).startOf('month').toJSDate();
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
}
