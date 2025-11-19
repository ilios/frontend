import { cached } from '@glimmer/tracking';
import { DateTime } from 'luxon';

/**
 * This is an object representation of an event, to be used in the
 * various calendars and week-at-a-glance.
 */
export default class Event {
  /**
   * ACHTUNG!
   * Using the constructor directly to instantiate a new Event object
   * from raw data is strongly discouraged.
   * Instead, use the `EventsBase::createEventFromData()` method,
   * which is available from the `UserEvents` or `SchoolEvents` services,
   * as this method applies crucial pre-processing to the data before
   * creating the Events object.
   * [ST 2025/11/19]
   *
   * @param {Object} data A plain-old JS object, containing all the event's data.
   */
  constructor(data) {
    // copies all attributes of the given data input to this Event object.
    Object.assign(this, data);
  }

  /**
   * The start-date/time of this event, for display purposes in a calendar.
   * This may differ from its actual start-date/time.
   * @return { String } The event's calendar start-date/time as ISO-formatted text.
   */
  @cached
  get calendarStartDate() {
    // ILMs don't really have a duration, they have due-date.
    // But in order to display them in a calendar, we have to make up a duration for them, otherwise they won't show up.
    // So we're filling in a start-date that's the equivalent of the actual due-date,
    // and give it an end-date that's fifteen minutes out.
    // However, if the given start-date is 11:45p or later in the day, that event would be considered to continue
    // into the next day, effectively making it a "multi-day" event.
    // Multi-days are currently not shown in the calendar, instead they are displayed in a table below the calendar.
    // To prevent this from happening, we pin the calendar display start-date to 11:45p and the end-date to 11:59p.
    if (this.ilmSession) {
      const startDate = DateTime.fromISO(this.startDate);
      if (23 === startDate.hour && 45 <= startDate.minute) {
        return startDate.set({ minute: 45 }).toUTC().toISO();
      }
    }
    return this.startDate;
  }

  /**
   * The end-date/time of this event, for display purposes in a calendar.
   * This may differ from its actual end-date/time.
   * @return { String } The event's calendar end-date/time as ISO-formatted text.
   */
  @cached
  get calendarEndDate() {
    // See comment block inside `Event::calendarStartDate()` for details on this logic.
    if (this.ilmSession) {
      const startDate = DateTime.fromISO(this.startDate);
      if (23 === startDate.hour && 45 <= startDate.minute) {
        return startDate.set({ minute: 59 }).toUTC().toISO();
      }
    }
    return this.endDate;
  }

  /**
   * Whether this event is considered "blanked" or not.
   * @returns {boolean}
   */
  @cached
  get isBlanked() {
    return !this.offering && !this.ilmSession;
  }
}
