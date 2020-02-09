import Component from '@glimmer/component';
import moment from 'moment';

export default class WeeklyCalendarEventComponent extends Component {

  get startMoment() {
    return moment(this.args.event.startDate);
  }
  get endMoment() {
    return moment(this.args.event.endDate);
  }
  get startOfDay() {
    return this.startMoment.startOf('day');
  }

  get startMinute() {
    return this.startMoment.diff(this.startOfDay, 'minutes');
  }

  get totalMinutes() {
    return this.endMoment.diff(this.startMoment, 'minutes');
  }

}
