import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class IliosCalendarMonthComponent extends Component {
  get ilmPreWorkEvents() {
    const preWork =  this.args.calendarEvents.reduce((arr, eventObject) => {
      return arr.pushObjects(eventObject.prerequisites);
    }, []);

    return preWork.filter(ev => ev.ilmSession);
  }

  get nonIlmPreWorkEvents() {
    return this.args.calendarEvents.filter(ev => {
      return ev.postrequisites.length === 0 || !ev.ilmSession;
    });
  }

  @action
  changeToDayView(date){
    if (this.args.areDaysSelectable && this.args.changeDate && this.args.changeView) {
      this.args.changeDate(date);
      this.args.changeView('day');
    }
  }
}
