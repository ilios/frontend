import Component from '@glimmer/component';
import { DateTime } from 'luxon';

export default class TimedReleaseSchedule extends Component {
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
    return DateTime.fromJSDate(new Date(this.args.startDate)) > DateTime.now();
  }
}
