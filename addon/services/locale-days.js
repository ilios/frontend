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
    const dt = DateTime.fromJSDate(dateTime);
    const endOfWeek = dt.endOf('week');
    if (this.intl.locale[0] === 'en-us') {
      const saturday = endOfWeek.minus({ days: 1 });
      if (saturday.diff(dt, 'days').days < 0) {
        return saturday.plus({ days: 7 }).toJSDate();
      }
      return saturday.toJSDate();
    }

    return endOfWeek.toJSDate();
  }

  firstDayOfDateWeek(dateTime) {
    const dt = DateTime.fromJSDate(dateTime);
    const startOfWeek = dt.startOf('week');
    if (this.intl.locale[0] === 'en-us') {
      const sunday = startOfWeek.minus({ days: 1 });
      if (dt.diff(sunday, 'days').days < 7) {
        return sunday.toJSDate();
      }

      return sunday.plus({ days: 7 }).toJSDate();
    }

    return startOfWeek.toJSDate();
  }
}
