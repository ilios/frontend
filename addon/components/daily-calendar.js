import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import moment from 'moment';
import { restartableTask } from 'ember-concurrency-decorators';
import { timeout } from 'ember-concurrency';

export default class DailyCalendarComponent extends Component {
  @service intl;
  @service moment;

  @restartableTask
  *scrollView(calendarElement, [earliestHour]) {
    //waiting ensures that {{ref}} modifier has time to setup hour elements
    yield timeout(1);
    // all of the hour elements are registered in the template as hour0, hour1, etc
    let hourElement = this.hour6;

    if (earliestHour < 24 && earliestHour > 2) {
      hourElement = this[`hour${earliestHour - 2}`];
    }
    calendarElement.scrollTop = hourElement.offsetTop;
  }

  get today() {
    return this.moment.moment(this.args.date).startOf('day');
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

  get hours() {
    return [...Array(24).keys()].map(i => {
      const time = this.today.hour(i);
      return {
        hour: time.format('H'),
        longName: time.format('LT'),
        shortName: time.format('hA'),
      };
    });
  }
}
