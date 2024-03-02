import Component from '@glimmer/component';
import { DateTime } from 'luxon';
import { tracked } from '@glimmer/tracking';
import { ensureSafeComponent } from '@embroider/util';
import IliosCalendarDay from './ilios-calendar-day';
import IliosCalendarWeek from './ilios-calendar-week';
import IliosCalendarMonth from './ilios-calendar-month';

export default class IliosCalendarComponent extends Component {
  @tracked showIcsFeed = false;

  get calendarViewComponent() {
    let calendar = IliosCalendarDay;
    if (this.args.selectedView === 'week') {
      calendar = IliosCalendarWeek;
    }
    if (this.args.selectedView === 'month') {
      calendar = IliosCalendarMonth;
    }

    return ensureSafeComponent(calendar, this);
  }

  get compiledCalendarEvents() {
    if (this.args.selectedView === 'day') {
      return this.args.calendarEvents;
    } else {
      const hashedEvents = {};
      this.args.calendarEvents.forEach((event) => {
        const hash =
          DateTime.fromISO(event.startDate).toISO() +
          DateTime.fromISO(event.endDate).toISO() +
          event.name;
        if (!(hash in hashedEvents)) {
          hashedEvents[hash] = [];
        }
        //clone our event, so we don't trample on the original when we change location
        hashedEvents[hash].push(Object.assign({}, event));
      });
      const compiledEvents = [];
      let hash;
      for (hash in hashedEvents) {
        const arr = hashedEvents[hash];
        const event = arr[0];
        if (arr.length > 1) {
          event.isMulti = true;
        }
        compiledEvents.push(event);
      }
      return compiledEvents;
    }
  }

  get sortedEvents() {
    return this.compiledCalendarEvents.sort((a, b) => {
      const aStartDate = DateTime.fromISO(a.startDate);
      const bStartDate = DateTime.fromISO(b.startDate);
      if (aStartDate > bStartDate) {
        return 1;
      } else if (aStartDate < bStartDate) {
        return -1;
      }

      const aEndDate = DateTime.fromISO(a.endDate);
      const bEndDate = DateTime.fromISO(b.endDate);
      if (aEndDate > bEndDate) {
        return 1;
      } else if (aEndDate < bEndDate) {
        return -1;
      }

      return a.title - b.title;
    });
  }

  get forwardDate() {
    return DateTime.fromJSDate(this.args.selectedDate)
      .plus(this.viewOpts(this.args.selectedView, 1))
      .toFormat('yyyy-MM-dd');
  }
  get backDate() {
    return DateTime.fromJSDate(this.args.selectedDate)
      .minus(this.viewOpts(this.args.selectedView, 1))
      .toFormat('yyyy-MM-dd');
  }
  get todayDate() {
    return DateTime.now().toFormat('yyyy-MM-dd');
  }

  viewOpts(view, value) {
    let opts = {};
    switch (view) {
      case 'month':
        opts = { month: value };
        break;
      case 'week':
        opts = { week: value };
        break;
      case 'day':
        opts = { day: value };
        break;
    }
    return opts;
  }
}
