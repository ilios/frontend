import Component from '@glimmer/component';
import { DateTime } from 'luxon';
export default class DashboardWeekComponent extends Component {
  get expanded() {
    const now = DateTime.now();
    const lastSunday = now.set({ weekday: 1 }).minus({ week: 1 }).toFormat('W');
    const thisSunday = now.set({ weekday: 1 }).toFormat('W');
    const nextSunday = now.set({ weekday: 1 }).plus({ week: 1 }).toFormat('W');

    return `${lastSunday}-${thisSunday}-${nextSunday}`;
  }
  get year() {
    return DateTime.now().year;
  }
  get week() {
    const today = DateTime.now();
    // In this component the week always starts on Sunday, but luxon's starts on Monday
    // so we need to adjust the week number to account for that.
    if (today.weekday === 7) {
      return today.weekNumber + 1;
    } else {
      return today.weekNumber;
    }
  }
}
