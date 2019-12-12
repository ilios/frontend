import Component from '@glimmer/component';
import moment from 'moment';

export default class TimedReleaseSchedule extends Component {

  constructor() {
    super(...arguments);
    this.now = new Date();
  }

  get showNoSchedule() {
    if (undefined === this.args.showNoSchedule) {
      return true;
    }
    return this.args.showNoSchedule;
  }

  get startDateInTheFuture() {
    if (! this.args.startDate) {
      return false;
    }
    return moment(this.args.startDate).isAfter(this.now);
  }

  get endDateInTheFuture() {
    if (! this.args.endDate) {
      return false;
    }
    return moment(this.args.endDate).isAfter(this.now);
  }
}
