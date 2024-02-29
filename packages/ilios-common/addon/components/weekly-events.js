import Component from '@glimmer/component';
import { action } from '@ember/object';
import { DateTime } from 'luxon';

export default class WeeklyEvents extends Component {
  get weeksInYear() {
    const weeksInTheYear = DateTime.now().set({ year: this.args.year }).weeksInWeekYear;
    const weeks = [];
    for (let i = 1; i <= weeksInTheYear; i++) {
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
