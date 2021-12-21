import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class IliosCalendarDayComponent extends Component {
  @service moment;

  get today() {
    return this.moment.moment(this.args.date).startOf('day');
  }
  get events() {
    return this.args.calendarEvents.filter(
      (event) =>
        this.moment.moment(event.startDate).isSame(this.today, 'day') ||
        this.moment.moment(event.endDate).isSame(this.today, 'day')
    );
  }
  get ilmPreWorkEvents() {
    const preWork = this.args.calendarEvents.reduce((arr, ev) => {
      if (!ev.isBlanked && ev.isPublished && !ev.isScheduled) {
        arr.pushObjects(ev.prerequisites);
      }
      return arr;
    }, []);

    return preWork
      .filter((ev) => ev.ilmSession)
      .filter((ev) => {
        return !ev.isBlanked && ev.isPublished && !ev.isScheduled;
      });
  }

  get nonIlmPreWorkEvents() {
    return this.events.filter((ev) => {
      return ev.postrequisites.length === 0 || !ev.ilmSession;
    });
  }

  get singleDayEvents() {
    return this.nonIlmPreWorkEvents.filter((event) =>
      this.moment.moment(event.startDate).isSame(this.moment.moment(event.endDate), 'day')
    );
  }
  get multiDayEvents() {
    return this.nonIlmPreWorkEvents.filter(
      (event) =>
        !this.moment.moment(event.startDate).isSame(this.moment.moment(event.endDate), 'day')
    );
  }
}
