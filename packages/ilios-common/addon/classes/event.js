import { cached } from '@glimmer/tracking';
import { DateTime } from 'luxon';
import { sortBy } from 'ilios-common/utils/array-helpers';

/**
 * Generates a slug from  given user event data.
 * @method getSlugForUserEvent
 * @param { String } startDate The event's start date
 * @param { Number|undefined } offeringId The event's offering ID
 * @param { Number|undefined } ilmSessionId The event's ILM session ID
 * @return { String }
 */
function getSlugForUserEvent(startDate, offeringId, ilmSessionId) {
  let slug = 'U';
  slug += DateTime.fromISO(startDate).toFormat('yyyyMMdd');
  if (offeringId) {
    slug += 'O' + offeringId;
  }
  if (ilmSessionId) {
    slug += 'I' + ilmSessionId;
  }
  return slug;
}

/**
 * Generates a slug for a given school event.
 * @method getSlugForSchoolEvent
 * @param { String } startDate The event's start date
 * @param { Number } schoolId The event's school ID
 * @param { Number|undefined } offeringId The event's offering ID
 * @param { Number|undefined } ilmSessionId The event's ILM session ID
 * @return { String }
 */
function getSlugForSchoolEvent(startDate, schoolId, offeringId, ilmSessionId) {
  let slug = 'S';
  schoolId = parseInt(schoolId, 10).toString();
  //always use a two digit schoolId
  if (schoolId.length === 1) {
    schoolId = '0' + schoolId;
  }
  slug += schoolId;
  slug += DateTime.fromISO(startDate).toFormat('yyyyMMdd');
  if (offeringId) {
    slug += 'O' + offeringId;
  }
  if (ilmSessionId) {
    slug += 'I' + ilmSessionId;
  }
  return slug;
}

/**
 * This is an object representation of an event, to be used in the
 * various calendars and week-at-a-glance.
 */
export default class Event {
  /** @var { Boolean } isUserEvent indicates whether this is a user event or a school event */
  isUserEvent;

  /**
   * @param { Object } data A plain-old JS object, containing all the event's data.
   * @param { Boolean } isUserEvent TRUE if the given object represents a user event, FALSE if it represents a school event.
   */
  constructor(data, isUserEvent) {
    this.isUserEvent = isUserEvent;
    // copies all attributes of the given data input to this Event object.
    Object.assign(this, data);
    // converts pre- and post-requisites into Events as well.
    this.prerequisites = sortBy(
      this.prerequisites.map((prereq) => {
        return new Event(
          {
            ...prereq,
            ...{
              startDate: this.startDate,
              postrequisiteName: this.name,
              postrequisiteSlug: this.slug,
            },
          },
          this.isUserEvent,
        );
      }),
      ['startDate', 'name'],
    );
    this.postrequisites = sortBy(
      this.postrequisites.map((postreq) => {
        return new Event(postreq, this.isUserEvent);
      }),
      ['startDate', 'name'],
    );
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
   * @return { Boolean }
   */
  @cached
  get isBlanked() {
    return !this.offering && !this.ilmSession;
  }

  /**
   * The event slug.
   * @return { String }
   */
  @cached
  get slug() {
    return this.isUserEvent
      ? getSlugForUserEvent(this.startDate, this.offering, this.ilmSession)
      : getSlugForSchoolEvent(this.startDate, this.school, this.offering, this.ilmSession);
  }
}
