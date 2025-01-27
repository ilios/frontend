import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { sortBy } from 'ilios-common/utils/array-helpers';
import { modifier } from 'ember-modifier';
import { DateTime } from 'luxon';

export default class WeeklyCalendarComponent extends Component {
  @service intl;
  @service localeDays;

  scrollView = modifier((element, [earliestHour]) => {
    // all of the hour elements are registered in the template as hour-0, hour-1, etc
    let hourElement = element.getElementsByClassName(`hour-6`)[0];

    if (earliestHour < 24 && earliestHour > 2) {
      hourElement = element.getElementsByClassName(`hour-${earliestHour}`)[0];
    }
    const { offsetTop } = hourElement;
    element.scrollTo({
      top: offsetTop,
      behavior: 'instant',
    });
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
