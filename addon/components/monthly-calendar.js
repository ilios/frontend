import Component from '@glimmer/component';
import moment from 'moment';

export default class MonthlyCalendarComponent extends Component {
  get sortedEvents() {
    if (!this.args.events) {
      return [];
    }

    return this.args.events.sortBy('startDate', 'endDate', 'name');
  }

  get eventDays() {
    const date = moment(this.args.date).startOf('month');
    const lastDayOfMonth = moment(this.args.date).endOf('month');
    const firstDayOfWeek = date.clone().startOf('week');
    const offset = date.diff(firstDayOfWeek, 'days');
    const days = [];

    while (date < lastDayOfMonth) {
      const day = {
        dayOfMonth: date.date(),
        dayOfWeek: date.day(),
        weekOfMonth: Math.ceil((date.date() + offset) / 7),
        name: date.format('dddd LL'),
        events: this.sortedEvents.filter(e => date.isSame(moment(e.startDate), 'day')),
      };
      days.push(day);
      date.add(1, 'day');
    }

    return days;
  }

  get days() {
    return [0, 1, 2, 3, 4, 5, 6].map(i => {
      return {
        longName: moment().startOf('week').add(i, 'days').format('dddd'),
        shortName: moment().startOf('week').add(i, 'days').format('ddd'),
      };
    });
  }
}
