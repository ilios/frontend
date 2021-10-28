import Component from '@glimmer/component';
import moment from 'moment';
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
        const hash = moment(event.startDate).format() + moment(event.endDate).format() + event.name;
        if (!(hash in hashedEvents)) {
          hashedEvents[hash] = [];
        }
        //clone our event so we don't trample on the original when we change location
        hashedEvents[hash].pushObject(Object.assign({}, event));
      });
      const compiledEvents = [];
      let hash;
      for (hash in hashedEvents) {
        const arr = hashedEvents[hash];
        const event = arr[0];
        if (arr.length > 1) {
          event.isMulti = true;
        }
        compiledEvents.pushObject(event);
      }
      return compiledEvents;
    }
  }

  get sortedEvents() {
    return this.compiledCalendarEvents.sort((a, b) => {
      const startDiff = moment(a.startDate).diff(moment(b.startDate));
      if (startDiff !== 0) {
        return startDiff;
      }

      const durationA = moment(a.startDate).diff(moment(a.endDate));
      const durationB = moment(b.startDate).diff(moment(b.endDate));

      const durationDiff = durationA - durationB;

      if (durationDiff !== 0) {
        return durationDiff;
      }

      return a.title - b.title;
    });
  }

  get forwardDate() {
    return moment(this.args.selectedDate).add(1, this.args.selectedView).format('YYYY-MM-DD');
  }
  get backDate() {
    return moment(this.args.selectedDate).subtract(1, this.args.selectedView).format('YYYY-MM-DD');
  }
  get todayDate() {
    return moment().format('YYYY-MM-DD');
  }
}
