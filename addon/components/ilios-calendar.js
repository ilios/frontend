import Component from '@glimmer/component';
import moment from 'moment';
import { tracked } from '@glimmer/tracking';
import { copy } from '@ember/object/internals';
import { action } from '@ember/object';

export default class IliosCalendarComponent extends Component {
  @tracked showIcsFeed = false;
  get compiledCalendarEvents(){
    if(this.args.selectedView === 'day'){
      return this.args.calendarEvents;
    } else {
      const hashedEvents = {};
      this.args.calendarEvents.forEach(event => {
        const hash = moment(event.startDate).format() +
          moment(event.endDate).format() +
          event.name;
        if (!(hash in hashedEvents)) {
          hashedEvents[hash] = [];
        }
        //clone our event so we don't trample on the original when we change location
        hashedEvents[hash].pushObject(copy(event));
      });
      const compiledEvents = [];
      let hash;
      for (hash in hashedEvents) {
        const arr = hashedEvents[hash];
        const event = arr[0];
        if (arr.length > 1) {
          event.isMulti = true;
        }
        compiledEvents.pushObject(event);
      }
      return compiledEvents;
    }
  }

  get sortedEvents(){
    return this.compiledCalendarEvents.sort((a, b) => {
      const startDiff = moment(a.startDate).diff(moment(b.startDate));
      if (startDiff !== 0) {
        return startDiff;
      }

      const durationA = moment(a.startDate).diff(moment(a.endDate));
      const durationB = moment(b.startDate).diff(moment(b.endDate));

      const durationDiff = durationA - durationB;

      if (durationDiff !== 0) {
        return durationDiff;
      }

      return a.title - b.title;
    });
  }

  @action
  goForward(){
    const newDate = moment(this.args.selectedDate).add(1, this.args.selectedView).toDate();
    this.args.changeDate(newDate);
  }
  @action
  goBack(){
    const newDate = moment(this.args.selectedDate).subtract(1, this.args.selectedView).toDate();
    this.args.changeDate(newDate);
  }
  @action
  gotoToday(){
    const newDate = moment().toDate();
    this.args.changeDate(newDate);
  }
}
