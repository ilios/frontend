import Component from '@glimmer/component';
import { DateTime } from 'luxon';
import colorChange from '../utils/color-change';
import { htmlSafe } from '@ember/template';
import calendarEventTooltip from '../utils/calendar-event-tooltip';
import { inject as service } from '@ember/service';

export default class WeeklyCalendarEventComponent extends Component {
  @service intl;

  constructor() {
    super(...arguments);
    const allMinutesInDay = Array(60 * 24).fill(0);
    this.args.allDayEvents.forEach(({ startDate, endDate }) => {
      const start = this.getMinuteInTheDay(startDate);
      const end = this.getMinuteInTheDay(endDate);
      for (let i = start; i <= end; i++) {
        allMinutesInDay[i - 1]++;
      }
    });

    this.minutes = allMinutesInDay;
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
    this.intl.locale;
    return calendarEventTooltip(this.args.event, this.intl, 'h:mma');
  }

  get recentlyUpdated() {
    const lastModifiedDate = DateTime.fromISO(this.args.event.lastModified);
    const today = DateTime.now();
    const { days } = today.diff(lastModifiedDate, 'days');

    return days < 6;
  }

  get startDateTime() {
    return DateTime.fromISO(this.args.event.startDate);
  }

  get endDateTime() {
    return DateTime.fromISO(this.args.event.endDate);
  }

  get startOfDay() {
    return this.startDateTime.startOf('day');
  }

  get startMinuteRounded() {
    const minute = this.startDateTime.diff(this.startOfDay, 'minutes').minutes;
    return Math.ceil(minute / 5);
  }

  get totalMinutesRounded() {
    const minutes = this.endDateTime.diff(this.startDateTime, 'minutes').minutes;
    return Math.floor(minutes / 5);
  }

  getMinuteInTheDay(date) {
    const m = DateTime.fromISO(date);
    const midnight = DateTime.fromISO(date).startOf('day');
    return m.diff(midnight, 'minutes').minutes;
  }

  get span() {
    const start = this.getMinuteInTheDay(this.args.event.startDate);
    const end = this.getMinuteInTheDay(this.args.event.endDate);

    const minutes = this.minutes.slice(start, end - 1);
    const max = Math.max(...minutes);

    return Math.floor(50 / max);
  }

  get style() {
    const { color } = this.args.event;
    const darkcolor = colorChange(color, -0.15);

    return new htmlSafe(
      `background-color: ${color};
       border-left: .25rem solid ${darkcolor};
       grid-column-start: span ${this.span};
       grid-row-start: ${this.startMinuteRounded + 1};
       grid-row-end: span ${this.totalMinutesRounded};`
    );
  }
}
