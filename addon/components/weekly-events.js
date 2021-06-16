import Component from '@glimmer/component';
import { action } from '@ember/object';
import moment from 'moment';

export default class WeeklyEvents extends Component {
  get weeksInYear() {
    const weeksInTheYear = moment().year(this.args.year).isoWeeksInYear();
    const weeks = [];
    for (let i = 1; i <= weeksInTheYear; i++) {
      weeks.push(`${i}`);
    }
    return weeks;
  }

  get weekInFocus() {
    return this.args.weekInFocus || 0;
  }

  @action
  incrementYear() {
    this.args.setYear(parseInt(this.args.year, 10) + 1);
  }

  @action
  decrementYear() {
    this.args.setYear(parseInt(this.args.year, 10) - 1);
  }
}
