import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { DateTime } from 'luxon';

export default class IliosCalendarDayComponent extends Component {
  @service localeDays;

  get today() {
    return DateTime.fromISO(this.args.date).startOf('day');
  }
  get events() {
    return this.args.calendarEvents.filter(
      (event) =>
        DateTime.fromISO(event.startDate).hasSame(this.today, 'day') ||
        DateTime.fromISO(event.endDate).hasSame(this.today, 'day')
    );
  }
  get ilmPreWorkEvents() {
    const preWork = this.args.calendarEvents.reduce((arr, ev) => {
      if (!ev.isBlanked && ev.isPublished && !ev.isScheduled) {
        arr = [...arr, ...ev.prerequisites];
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
      DateTime.fromISO(event.startDate).hasSame(DateTime.fromISO(event.endDate), 'day')
    );
  }
  get multiDayEvents() {
    return this.nonIlmPreWorkEvents.filter(
      (event) => !DateTime.fromISO(event.startDate).hasSame(DateTime.fromISO(event.endDate), 'day')
    );
  }
}
