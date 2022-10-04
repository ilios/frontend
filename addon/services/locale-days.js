import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { DateTime } from 'luxon';

export default class LocaleDaysService extends Service {
  @service intl;

  get firstDayOfThisWeek() {
    return this.firstDayOfDateWeek(DateTime.now().toJSDate());
  }

  get lastDayOfThisWeek() {
    return this.lastDayOfDateWeek(DateTime.now().toJSDate());
  }

  lastDayOfDateWeek(dateTime) {
    const dt = DateTime.fromJSDate(dateTime).set({ hour: 0, minute: 0, second: 0 }).endOf('week');
    if (this.intl.locale[0] === 'en-us') {
      return dt.minus({ days: 1 }).toJSDate();
    }

    return dt.toJSDate();
  }

  firstDayOfDateWeek(dateTime) {
    const dt = DateTime.fromJSDate(dateTime).set({ hour: 0, minute: 0, second: 0 }).startOf('week');
    if (this.intl.locale[0] === 'en-us') {
      return dt.minus({ days: 1 }).toJSDate();
    }

    return dt.toJSDate();
  }
}
