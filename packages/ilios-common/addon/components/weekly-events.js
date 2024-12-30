import Component from '@glimmer/component';
import { action } from '@ember/object';
import { DateTime } from 'luxon';

export default class WeeklyEvents extends Component {
  get weeksInYear() {
    const { weeksInWeekYear } = DateTime.fromObject({ year: this.args.year });
    const weeks = [];
    for (let i = 1; i <= weeksInWeekYear; i++) {
      weeks.push(`${i}`);
    }
    return weeks;
  }

  get weekInFocus() {
    return this.args.weekInFocus || '';
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
