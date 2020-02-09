import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import moment from 'moment';

export default class WeeklyCalendarComponent extends Component {
  @service intl;
  @service moment;

  @action
  scrollView(calendarElement, [earliestHour]) {
    if (earliestHour === 24 || earliestHour < 2) {
      return;
    }
    calendarElement.scrollTop = this[`hour${earliestHour - 2}`].offsetTop;
  }

  get firstDayOfWeek() {
    //access the locale info here so the getter will recompute when it changes
    this.moment.locale;
    this.intl.locale;
    return moment(this.args.date).startOf('week').hour(0).minute(0).second(0);
  }

  get lastDayOfWeek() {
    return this.firstDayOfWeek.add(7, 'days');
  }

  get week() {
    return [...Array(7).keys()].map(i => {
      const date = this.firstDayOfWeek.add(i, 'days');
      return {
        date: date.toDate(),
        longName: date.format('dddd'),
        shortName: date.toDate('ddd'),
        dayOfWeek: i + 1
      };
    });
  }

  get earliestHour() {
    if (!this.args.events) {
      return null;
    }

    return this.sortedEvents.reduce((earliestHour, event) => {
      const hour = Number(moment(event.startDate).format('H'));
      return hour < earliestHour ? hour : earliestHour;
    }, 24);
  }

  get sortedEvents() {
    if (!this.args.events) {
      return [];
    }

    return this.args.events.sortBy('startDate', 'endDate', 'name');
  }

  get eventDays() {
    return this.week.map(day => {
      day.events = this.sortedEvents.filter(e => moment(day.date).isSame(moment(e.startDate), 'day'));
      return day;
    });
  }

  get days() {
    return this.eventDays.map(day => {
      const date = moment(day.date);
      day.dayOfWeek = date.weekday() + 1;
      day.fullName = date.format('dddd LL');

      return day;
    });
  }

  get dayNames() {
    //access the locale info here so the getter will recompute when it changes
    this.moment.locale;
    this.intl.locale;
    const longDays = moment.weekdays(true);
    const shortDays = moment.weekdaysShort(true);

    return [...Array(7).keys()].map(i => {
      return {
        day: i + 1,
        longName: longDays[i],
        shortName: shortDays[i],
      };
    });
  }

  get hours() {
    return [...Array(24).keys()].map(i => {
      const time = this.firstDayOfWeek.hour(i);
      return {
        hour: time.format('H'),
        name: time.format('LT'),
      };
    });
  }
}
