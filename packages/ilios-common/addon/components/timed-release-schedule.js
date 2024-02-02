import Component from '@glimmer/component';
import moment from 'moment';

export default class TimedReleaseSchedule extends Component {
  now = new Date();

  get show() {
    return this.showNoSchedule || this.args.endDate || this.startDateInTheFuture;
  }

  get showNoSchedule() {
    if (undefined === this.args.showNoSchedule) {
      return true;
    }
    return this.args.showNoSchedule;
  }

  get startDateInTheFuture() {
    if (!this.args.startDate) {
      return false;
    }
    return moment(this.args.startDate).isAfter(this.now);
  }
}
