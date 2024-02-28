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
    //set day to Thursday to correctly calculate isoWeek
    return DateTime.now().set({ weekday: 4 }).weekNumber;
  }
}
