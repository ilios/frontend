import Component from '@glimmer/component';
import { service } from '@ember/service';
import { restartableTask, timeout } from 'ember-concurrency';
import { action, set } from '@ember/object';
import { DateTime } from 'luxon';
import { sortBy } from 'ilios-common/utils/array-helpers';
import scrollIntoView from 'scroll-into-view';

export default class WeeklyCalendarComponent extends Component {
  @service intl;
  @service localeDays;

  scrollView = restartableTask(async (calendarElement, [earliestHour]) => {
    //waiting ensures that setHour has time to setup hour elements
    await timeout(1);
    // all of the hour elements are registered in the template as hour0, hour1, etc
    let hourElement = this.hour6;

    if (earliestHour < 24 && earliestHour > 2) {
      hourElement = this[`hour${earliestHour}`];
    }
    scrollIntoView(hourElement, { align: { top: 0 } });
  });

  get firstDayOfWeek() {
    return this.localeDays.firstDayOfDateWeek(this.args.date);
  }

  get lastDayOfWeek() {
    return this.localeDays.lastDayOfDateWeek(this.args.date);
  }

  get week() {
    return [...Array(7).keys()].map((i) => {
      const date = DateTime.fromJSDate(this.firstDayOfWeek).plus({ days: i });
      return {
        date: date.toJSDate(),
        dayOfWeek: i + 1,
        fullName: date.toFormat('dddd LL'),
      };
    });
  }

  get earliestHour() {
    if (!this.args.events) {
      return null;
    }

    return this.sortedEvents.reduce((earliestHour, event) => {
      const hour = Number(DateTime.fromISO(event.startDate).toFormat('HH'));
      return hour < earliestHour ? hour : earliestHour;
    }, 24);
  }

  get sortedEvents() {
    if (!this.args.events) {
      return [];
    }

    return sortBy(this.args.events, ['startDate', 'endDate', 'name']);
  }

  get days() {
    return this.week.map((day) => {
      const dt = DateTime.fromJSDate(day.date);
      day.events = this.sortedEvents.filter((e) =>
        dt.hasSame(DateTime.fromISO(e.startDate), 'day'),
      );
      return day;
    });
  }

  get hours() {
    return [...Array(24).keys()].map((i) => {
      const time = DateTime.fromJSDate(this.firstDayOfWeek).set({ hour: i });
      return {
        hour: time.toFormat('H'),
        longName: this.intl.formatDate(time, { hour: 'numeric', minute: 'numeric' }),
        shortName: this.intl.formatDate(time, { hour: 'numeric' }),
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

  @action
  changeToDayView(date) {
    this.args.changeToDayView(DateTime.fromJSDate(date).toFormat('yyyy-MM-dd'));
  }
}
