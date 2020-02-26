import Component from '@glimmer/component';
import moment from 'moment';
import { action } from '@ember/object';

export default class IliosCalendarWeekComponent extends Component {
  get weekOf(){
    return moment(this.args.date).startOf('week').format('MMMM Do YYYY');
  }
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
  get singleDayEvents(){
    return this.nonIlmPreWorkEvents.filter(
      event => moment(event.startDate).isSame(moment(event.endDate), 'day')
    );
  }
  get multiDayEventsList(){
    return this.nonIlmPreWorkEvents.filter(
      event => !moment(event.startDate).isSame(moment(event.endDate), 'day')
    );
  }

  @action
  changeToDayView(date){
    if (this.args.areDaysSelectable && this.args.changeDate && this.args.changeView) {
      this.args.changeDate(date);
      this.args.changeView('day');
    }
  }
}
