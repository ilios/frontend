import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { DateTime } from 'luxon';

export default class LocaleDaysService extends Service {
  @service intl;

  get firstDayOfThisWeek() {
    const dt = DateTime.fromObject({ hour: 0, minute: 0, second: 0 }).startOf('week');
    if (this.intl.locale[0] === 'en-us') {
      return dt.minus({ days: 1 }).toJSDate();
    }

    return dt.toJSDate();
  }

  get lastDayOfThisWeek() {
    const dt = DateTime.fromObject({ hour: 23, minute: 59, second: 59 }).endOf('week');
    if (this.intl.locale[0] === 'en-us') {
      return dt.minus({ days: 1 }).toJSDate();
    }

    return dt.toJSDate();
  }
}
