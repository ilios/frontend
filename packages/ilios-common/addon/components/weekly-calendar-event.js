import Component from '@glimmer/component';
import { DateTime } from 'luxon';
import colorChange from 'ilios-common/utils/color-change';
import { htmlSafe } from '@ember/template';
import calendarEventTooltip from 'ilios-common/utils/calendar-event-tooltip';
import { service } from '@ember/service';
import { guidFor } from '@ember/object/internals';

export default class WeeklyCalendarEventComponent extends Component {
  @service intl;

  get eventButtonId() {
    return `weekly-calendar-event-button-${guidFor(this)}`;
  }

  get eventButtonElement() {
    return document.getElementById(this.eventButtonId);
  }

  get minutes() {
    const allMinutesInDay = Array(60 * 24).fill(0);
    this.args.allDayEvents.forEach(({ startDate, endDate }) => {
      const start = this.getMinuteInTheDay(DateTime.fromISO(startDate));
      const end = this.getMinuteInTheDay(DateTime.fromISO(endDate));
      for (let i = start; i <= end; i++) {
        allMinutesInDay[i - 1]++;
      }
    });

    return allMinutesInDay;
  }

  get startDateTime() {
    return DateTime.fromISO(this.args.event.startDate);
  }

  get endDateTime() {
    return DateTime.fromISO(this.args.event.endDate);
  }

  get startDate() {
    return this.startDateTime.toJSDate();
  }

  get endDate() {
    return this.endDateTime.toJSDate();
  }

  get lastModifiedDateTime() {
    return DateTime.fromISO(this.args.event.lastModified);
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
    return calendarEventTooltip(this.args.event, this.intl, 'h:mma');
  }

  get recentlyUpdated() {
    const today = DateTime.now();
    const { days } = today.diff(this.lastModifiedDateTime, 'days');

    return days < 6;
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

  getMinuteInTheDay(dt) {
    const midnight = dt.startOf('day');
    return dt.diff(midnight, 'minutes').minutes;
  }

  get span() {
    const start = this.getMinuteInTheDay(this.startDateTime);
    const end = this.getMinuteInTheDay(this.endDateTime);

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
       grid-row-end: span ${this.totalMinutesRounded};`,
    );
  }
}
