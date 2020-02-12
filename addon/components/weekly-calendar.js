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
    // all of the hour elements are registered in the template as hour0, hour1, etc
    const hourElement = this[`hour${earliestHour - 2}`];
    calendarElement.scrollTop = hourElement.offsetTop;
  }

  get firstDayOfWeek() {
    return this.moment.moment(this.args.date).startOf('week');
  }

  get lastDayOfWeek() {
    return this.firstDayOfWeek.endOf('week');
  }

  get week() {
    return [...Array(7).keys()].map(i => {
      const date = this.firstDayOfWeek.add(i, 'days');
      return {
        date: date.toDate(),
        longName: date.format('dddd'),
        shortName: date.format('ddd'),
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
