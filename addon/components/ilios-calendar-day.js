import Component from '@glimmer/component';
import moment from 'moment';

export default class IliosCalendarDayComponent extends Component {
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
  multiDayEvents(){
    return this.nonIlmPreWorkEvents.filter(
      event => !moment(event.startDate).isSame(moment(event.endDate), 'day')
    );
  }

  scroll(element){
    element.querySelector(".el-calendar .week").scrollTop = 500;
  }
}
