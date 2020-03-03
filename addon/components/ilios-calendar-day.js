import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class IliosCalendarDayComponent extends Component {
  @service moment;

  get today() {
    return this.moment.moment(this.args.date).startOf('day');
  }
  get events() {
    return this.args.calendarEvents.filter(
      event =>
        this.moment.moment(event.startDate).isSame(this.today, 'day') ||
        this.moment.moment(event.endDate).isSame(this.today, 'day')
    );
  }
  get ilmPreWorkEvents() {
    const preWork =  this.events.reduce((arr, eventObject) => {
      return arr.pushObjects(eventObject.prerequisites);
    }, []);

    return preWork.filter(ev => ev.ilmSession);
  }

  get nonIlmPreWorkEvents() {
    return this.events.filter(ev => {
      return ev.postrequisites.length === 0 || !ev.ilmSession;
    });
  }

  get singleDayEvents(){
    return this.nonIlmPreWorkEvents.filter(
      event => this.moment.moment(event.startDate).isSame(this.moment.moment(event.endDate), 'day')
    );
  }
  multiDayEvents(){
    return this.nonIlmPreWorkEvents.filter(
      event => !this.moment.moment(event.startDate).isSame(this.moment.moment(event.endDate), 'day')
    );
  }
}
