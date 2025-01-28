import Component from '@glimmer/component';
import { service } from '@ember/service';
import { sortBy } from 'ilios-common/utils/array-helpers';
import { modifier } from 'ember-modifier';
import { DateTime } from 'luxon';

export default class DailyCalendarComponent extends Component {
  @service intl;

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

  get earliestHour() {
    if (!this.args.events) {
      return null;
    }

    return this.sortedEvents.reduce((earliestHour, event) => {
      const { hour } = DateTime.fromISO(event.startDate);
      return hour < earliestHour ? hour : earliestHour;
    }, 24);
  }

  get sortedEvents() {
    if (!this.args.events) {
      return [];
    }

    return sortBy(this.args.events, ['startDate', 'endDate', 'name']);
  }

  get hours() {
    const today = DateTime.fromJSDate(this.args.date).startOf('day');
    return [...Array(24).keys()].map((i) => {
      const time = today.set({ hour: i });
      return {
        hour: time.hour,
        longName: this.intl.formatDate(time, { hour: 'numeric', minute: 'numeric' }),
        shortName: this.intl.formatDate(time, { hour: 'numeric' }),
      };
    });
  }
}
