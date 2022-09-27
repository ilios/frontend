import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { sortBy } from '../utils/array-helpers';
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
    return DateTime.fromISO(this.args.date).startOf('month').toJSDate();
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
