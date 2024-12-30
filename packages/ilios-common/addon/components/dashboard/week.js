import Component from '@glimmer/component';
import { DateTime } from 'luxon';

export default class DashboardWeekComponent extends Component {
  get expanded() {
    const lastSunday = this.thisThursday.minus({ week: 1 }).toFormat('W');
    const thisSunday = this.thisThursday.toFormat('W');
    const nextSunday = this.thisThursday.plus({ week: 1 }).toFormat('W');

    return `${lastSunday}-${thisSunday}-${nextSunday}`;
  }

  get thisThursday() {
    const thursday = DateTime.fromObject({
      weekday: 4,
      hour: 0,
      minute: 0,
      second: 0,
    });

    // In this component the week always starts on Sunday, but luxon's starts on Monday
    // If today is sunday, we need to add a week to get the correct Thursday
    if (DateTime.now().weekday === 7) {
      return thursday.plus({ weeks: 1 });
    }

    return thursday;
  }

  get year() {
    return this.thisThursday.weekYear;
  }

  get week() {
    return this.thisThursday.weekNumber;
  }
}
