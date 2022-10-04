import Component from '@glimmer/component';
import { DateTime } from 'luxon';
import colorChange from '../utils/color-change';
import { htmlSafe } from '@ember/template';
import calendarEventTooltip from '../utils/calendar-event-tooltip';
import { inject as service } from '@ember/service';
import { deprecate } from '@ember/debug';

export default class WeeklyCalendarEventComponent extends Component {
  @service intl;

  constructor() {
    super(...arguments);
    const allMinutesInDay = Array(60 * 24).fill(0);
    this.args.allDayEvents.forEach(({ startDate, endDate }) => {
      if (typeof startDate === 'object') {
        deprecate(
          `Object passed to WeeklyCalendar @allDayEvents.startDate instead of ISO string`,
          false,
          {
            id: 'common.dates-no-dates',
            for: 'ilios-common',
            until: '72',
            since: '71',
          }
        );
        startDate = DateTime.fromJSDate(startDate).toISO();
      }
      if (typeof endDate === 'object') {
        deprecate(
          `Object passed to WeeklyCalendar @allDayEvents.endDate instead of ISO string`,
          false,
          {
            id: 'common.dates-no-dates',
            for: 'ilios-common',
            until: '72',
            since: '71',
          }
        );
        endDate = DateTime.fromJSDate(endDate).toISO();
      }
      const start = this.getMinuteInTheDay(DateTime.fromISO(startDate));
      const end = this.getMinuteInTheDay(DateTime.fromISO(endDate));
      for (let i = start; i <= end; i++) {
        allMinutesInDay[i - 1]++;
      }
    });

    this.minutes = allMinutesInDay;
  }

  get startDateTime() {
    if (typeof this.args.event.startDate === 'object') {
      deprecate(
        `Object passed to WeeklyCalendarEvent @event.startDate instead of ISO string`,
        false,
        {
          id: 'common.dates-no-dates',
          for: 'ilios-common',
          until: '72',
          since: '71',
        }
      );
      return DateTime.fromJSDate(this.args.event.startDate);
    }
    return DateTime.fromISO(this.args.event.startDate);
  }

  get endDateTime() {
    if (typeof this.args.event.endDate === 'object') {
      deprecate(
        `Object passed to WeeklyCalendarEvent @event.endDate instead of ISO string`,
        false,
        {
          id: 'common.dates-no-dates',
          for: 'ilios-common',
          until: '72',
          since: '71',
        }
      );
      return DateTime.fromJSDate(this.args.event.endDate);
    }
    return DateTime.fromISO(this.args.event.endDate);
  }

  get startDate() {
    return this.startDateTime.toJSDate();
  }

  get endDate() {
    return this.endDateTime.toJSDate();
  }

  get lastModifiedDateTime() {
    if (typeof this.args.event.lastModified === 'object') {
      deprecate(
        `Object passed to WeeklyCalendarEvent @event.lastModified instead of ISO string`,
        false,
        {
          id: 'common.dates-no-dates',
          for: 'ilios-common',
          until: '72',
          since: '71',
        }
      );
      return DateTime.fromJSDate(this.args.event.lastModified);
    }
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
    this.intl.locale;
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
       grid-row-end: span ${this.totalMinutesRounded};`
    );
  }
}
