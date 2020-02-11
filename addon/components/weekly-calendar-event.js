import Component from '@glimmer/component';
import moment from 'moment';
import colorChange from '../utils/color-change';
import { htmlSafe } from '@ember/string';

export default class WeeklyCalendarEventComponent extends Component {
  constructor() {
    super(...arguments);
    const allMinutesInDay = Array((60 * 24)).fill(0);
    this.args.allDayEvents.forEach(({ startDate, endDate }) => {
      const start = this.getMinuteInTheDay(startDate);
      const end = this.getMinuteInTheDay(endDate);
      for (let i = start; i <= end; i++) {
        allMinutesInDay[i-1]++;
      }
    });

    this.minutes = allMinutesInDay;
  }

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

  getEventsInSameSpace(event) {
    const startMoment = moment(event.startDate);
    const endMoment = moment(event.endDate);
    return this.args.allDayEvents.filter(e => {
      const eStartMoment = moment(e.startDate);
      const eEndMoment = moment(e.endDate);

      //events which touch are not in the same space
      if (
        endMoment.isSame(eStartMoment, 'minute') ||
        startMoment.isSame(eEndMoment, 'minute')
      ) {
        return false;
      }
      return startMoment.isBetween(
        eStartMoment,
        eEndMoment,
        'minute',
        '[]'
      ) || endMoment.isBetween(
        eStartMoment,
        eEndMoment,
        'minute',
        '[]'
      );
    });
  }

  getMinuteInTheDay(date) {
    const m = moment(date);
    const midnight = moment(date).startOf('day');
    return  m.diff(midnight, 'minutes');
  }

  get width() {
    const start = this.getMinuteInTheDay(this.args.event.startDate);
    const end = this.getMinuteInTheDay(this.args.event.endDate);

    const minutes = this.minutes.slice(start, end - 1);
    const max = Math.max(...minutes);

    return 100 / max;
  }

  get left() {
    const eventsInTheSameSpace = this.getEventsInSameSpace(this.args.event);
    eventsInTheSameSpace.sort(({ startDate: s1, endDate: e1 }, { startDate: s2, endDate: e2 }) => {
      const d1 = moment(e1).diff(moment(s1), 'minutes');
      const d2 = moment(e2).diff(moment(s2), 'minutes');

      return d2 - d1;
    });

    return eventsInTheSameSpace.indexOf(this.args.event) * this.width;
  }

  get style() {
    const { color } = this.args.event;
    const darkcolor = colorChange(color, -0.15);

    return new htmlSafe(
      `background-color: ${color};
       border-left: .25rem solid ${darkcolor};
       width: ${this.width}%;
       margin-left: ${this.left}%;
       grid-row-start: ${this.startMinute + 1};
       grid-row-end: span ${this.totalMinutes};`
    );
  }

}
