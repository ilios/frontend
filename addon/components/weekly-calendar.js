import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { restartableTask, timeout } from 'ember-concurrency';
import { action, set } from '@ember/object';
import moment from 'moment';
import { sortBy } from '../utils/array-helpers';

export default class WeeklyCalendarComponent extends Component {
  @service intl;
  @service moment;

  scrollView = restartableTask(async (calendarElement, [earliestHour]) => {
    //waiting ensures that setHour has time to setup hour elements
    await timeout(1);
    // all of the hour elements are registered in the template as hour0, hour1, etc
    let hourElement = this.hour6;

    if (earliestHour < 24 && earliestHour > 2) {
      hourElement = this[`hour${earliestHour - 2}`];
    }
    calendarElement.scrollTop = hourElement.offsetTop;
  });

  get firstDayOfWeek() {
    this.intl.locale; //access to start autotracking
    return this.moment.moment(this.args.date).startOf('week');
  }

  get lastDayOfWeek() {
    return this.firstDayOfWeek.endOf('week');
  }

  get week() {
    return [...Array(7).keys()].map((i) => {
      const date = this.firstDayOfWeek.add(i, 'days');
      return {
        date: date.toDate(),
        dayOfWeek: i + 1,
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

    return sortBy(this.args.events, ['name', 'endDate', 'startDate']);
  }

  get eventDays() {
    return this.week.map((day) => {
      day.events = this.sortedEvents.filter((e) =>
        moment(day.date).isSame(moment(e.startDate), 'day')
      );
      return day;
    });
  }

  get days() {
    return this.eventDays.map((day) => {
      const date = moment(day.date);
      day.dayOfWeek = date.weekday() + 1;
      day.fullName = date.format('dddd LL');

      return day;
    });
  }

  get hours() {
    return [...Array(24).keys()].map((i) => {
      const time = this.firstDayOfWeek.hour(i);
      return {
        hour: time.format('H'),
        longName: time.format('LT'),
        shortName: time.format('hA'),
      };
    });
  }

  @action
  setHour(element, [hour]) {
    set(this, `hour${hour}`, element);
  }

  @action
  selectEvent(event) {
    if (event.isMulti) {
      this.args.changeToDayView(event.startDate);
    } else {
      this.args.selectEvent(event);
    }
  }
}
