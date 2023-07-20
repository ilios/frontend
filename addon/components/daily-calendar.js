import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action, set } from '@ember/object';
import { sortBy } from 'ilios-common/utils/array-helpers';
import { DateTime } from 'luxon';
import { deprecate } from '@ember/debug';

export default class DailyCalendarComponent extends Component {
  @service intl;

  get date() {
    if (typeof this.args.date === 'string') {
      deprecate(`String passed to DailyCalendar @date instead of Date`, false, {
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
        deprecate(`Object passed to DailyCalendar @events.startDate instead of ISO string`, false, {
          id: 'common.dates-no-dates',
          for: 'ilios-common',
          until: '72',
          since: '71',
        });
        event.startDate = DateTime.fromJSDate(event.startDate).toISO();
      }
      if (typeof event.endDate === 'object') {
        deprecate(`Object passed to DailyCalendar @events.endDate instead of ISO string`, false, {
          id: 'common.dates-no-dates',
          for: 'ilios-common',
          until: '72',
          since: '71',
        });
        event.endDate = DateTime.fromJSDate(event.endDate).toISO();
      }

      return event;
    });

    return sortBy(events, ['startDate', 'endDate', 'name']);
  }

  get hours() {
    const today = DateTime.fromJSDate(this.date).startOf('day');
    return [...Array(24).keys()].map((i) => {
      const time = today.set({ hour: i });
      return {
        hour: time.hour,
        longName: this.intl.formatDate(time, { hour: 'numeric', minute: 'numeric' }),
        shortName: this.intl.formatDate(time, { hour: 'numeric' }),
      };
    });
  }

  @action
  setHour(element, [hour]) {
    set(this, `hour${hour}`, element);
  }
}
