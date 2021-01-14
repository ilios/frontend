import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class IliosCalendarMonthComponent extends Component {
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
    return this.args.calendarEvents.filter((ev) => {
      return ev.postrequisites.length === 0 || !ev.ilmSession;
    });
  }

  @action
  changeToDayView(date) {
    if (
      this.args.areDaysSelectable &&
      this.args.changeDate &&
      this.args.changeView
    ) {
      this.args.changeDate(date);
      this.args.changeView('day');
    }
  }
}
