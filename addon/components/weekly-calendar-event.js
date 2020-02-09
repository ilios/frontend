import Component from '@glimmer/component';
import moment from 'moment';
import colorChange from '../utils/color-change';
import { htmlSafe } from '@ember/string';

export default class WeeklyCalendarEventComponent extends Component {

  get startMoment() {
    return moment(this.args.event.startDate);
  }
  get endMoment() {
    return moment(this.args.event.endDate);
  }
  get startOfDay() {
    return this.startMoment.startOf('day');
  }

  get startMinute() {
    return this.startMoment.diff(this.startOfDay, 'minutes');
  }

  get totalMinutes() {
    return this.endMoment.diff(this.startMoment, 'minutes');
  }

  get countOfEventsInSameSpace() {
    const { startMoment, endMoment } = this;
    const events = this.args.otherDayEvents.filter(event => {
      const eStartMoment = moment(event.startDate);
      const eEndMoment = moment(event.endDate);
      return eStartMoment.isBetween(
        startMoment,
        endMoment,
        'minute',
        '[]'
      ) || eEndMoment.isBetween(
        startMoment,
        endMoment,
        'minute',
        '[]'
      );
    });

    return events.length + 1;
  }

  get style() {
    const { color } = this.args.event;
    const darkcolor = colorChange(color, -0.15);
    const width = 100 / this.countOfEventsInSameSpace;
    const left = width * this.args.i;

    return new htmlSafe(
      `background-color: ${color};
       border-left: 4px solid ${darkcolor};
       width: ${width}%;
       margin-left: ${left}%;`
    );
  }

}
