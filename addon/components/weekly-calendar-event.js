import Component from '@glimmer/component';
import moment from 'moment';
import colorChange from '../utils/color-change';
import { htmlSafe } from '@ember/string';
import calendarEventTooltip from '../utils/calendar-event-tooltip';
import { inject as service } from '@ember/service';

export default class WeeklyCalendarEventComponent extends Component {
  @service intl;
  @service moment;

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

    this.eventsInSameSpace = this.args.allDayEvents.filter(e => {
      const startMoment = moment(e.startDate);
      const endMoment = moment(e.endDate);

      //events which touch are not in the same space
      if (
        this.endMoment.isSame(startMoment, 'minute') ||
        this.startMoment.isSame(endMoment, 'minute')
      ) {
        return false;
      }
      return this.startMoment.isBetween(
        startMoment,
        endMoment,
        'minute',
        '[]'
      ) || this.endMoment.isBetween(
        startMoment,
        endMoment,
        'minute',
        '[]'
      );
    });
  }

  get isIlm() {
    return !!this.args.event.ilmSession;
  }

  get isOffering() {
    return !!this.args.event.offering;
  }

  get clickable() {
    return this.isIlm || this.isOffering;
  }

  get tooltipContent() {
    //access the locale info here so the getter will recompute when it changes
    this.moment.locale;
    this.intl.locale;
    return calendarEventTooltip(this.args.event, this.intl, 'h:mma');
  }

  get recentlyUpdated() {
    const lastModifiedDate = moment(this.args.event.lastModified);
    const today = moment();
    const daysSinceLastUpdate = today.diff(lastModifiedDate, 'days');

    return daysSinceLastUpdate < 6 ? true : false;
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
    const events = this.eventsInSameSpace;
    events.sort(({ startDate: s1, endDate: e1 }, { startDate: s2, endDate: e2 }) => {
      const d1 = moment(e1).diff(moment(s1), 'minutes');
      const d2 = moment(e2).diff(moment(s2), 'minutes');

      return d2 - d1;
    });

    return events.indexOf(this.args.event) * this.width;
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
