import Component from '@glimmer/component';
import moment from 'moment';

export default class DashboardWeekComponent extends Component {
  get expanded() {
    const lastSunday = moment().day(1).subtract(1, 'week').format('W');
    const thisSunday = moment().day(1).format('W');
    const nextSunday = moment().day(1).add(1, 'week').format('W');

    return `${lastSunday}-${thisSunday}-${nextSunday}`;
  }
  get year() {
    return moment().year();
  }
  get week() {
    //set day to Thursday to correctly calculate isoWeek
    return moment().day(4).isoWeek();
  }
}
