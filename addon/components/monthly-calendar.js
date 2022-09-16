import Component from '@glimmer/component';
import moment from 'moment';
import { inject as service } from '@ember/service';
import { sortBy } from '../utils/array-helpers';

export default class MonthlyCalendarComponent extends Component {
  @service intl;
  @service moment;

  get sortedEvents() {
    if (!this.args.events) {
      return [];
    }

    return sortBy(this.args.events, ['name', 'endDate', 'startDate']);
  }

  get firstDayOfMonth() {
    return moment(this.args.date).startOf('month');
  }

  get month() {
    const date = this.firstDayOfMonth;
    const lastDayOfMonth = moment(this.args.date).endOf('month');
    const days = [];

    while (date.isBefore(lastDayOfMonth)) {
      const day = {
        date: date.toDate(),
        dayOfMonth: date.date(),
      };
      days.push(day);
      date.add(1, 'day');
    }

    return days;
  }

  get eventDays() {
    return this.month.map((day) => {
      day.events = this.sortedEvents.filter((e) =>
        moment(day.date).isSame(moment(e.startDate), 'day')
      );
      return day;
    });
  }

  get days() {
    //access the locale info here so the getter will recompute when it changes
    this.moment.locale;
    this.intl.locale;

    const firstDayOfWeek = this.firstDayOfMonth.clone().weekday(0);
    const offset = this.firstDayOfMonth.diff(firstDayOfWeek, 'days');

    return this.eventDays.map((day) => {
      const date = moment(day.date);
      day.dayOfWeek = date.weekday() + 1;
      day.weekOfMonth = Math.ceil((date.date() + offset) / 7);
      day.name = date.format('dddd LL');

      return day;
    });
  }

  get dayNames() {
    //access the locale info here so the getter will recompute when it changes
    this.moment.locale;
    this.intl.locale;
    const longDays = moment.weekdays(true);
    const shortDays = moment.weekdaysShort(true);

    return [0, 1, 2, 3, 4, 5, 6].map((i) => {
      return {
        day: i + 1,
        longName: longDays[i],
        shortName: shortDays[i],
      };
    });
  }
}
