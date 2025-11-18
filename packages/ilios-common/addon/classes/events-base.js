import Service from '@ember/service';
import { DateTime } from 'luxon';
import { mapBy, sortBy, uniqueValues } from 'ilios-common/utils/array-helpers';
import { getSlug } from 'ilios-common/utils/event-helpers';

export default class EventsBase extends Service {
  /**
   * Proxy handler for events.
   */
  handler = {
    get(target, prop /*, receiver */) {
      switch (prop) {
        case 'calendarStartDate': {
          const startDate = DateTime.fromISO(target.startDate);
          if (target.ilmSession && 23 === startDate.hour && startDate.minute >= 45) {
            return startDate.set({ minute: 45 }).toUTC().toISO();
          }
          return target.startDate;
        }
        case 'calendarEndDate': {
          const startDate = DateTime.fromISO(target.startDate);
          if (target.ilmSession && 23 === startDate.hour && startDate.minute >= 45) {
            return startDate.set({ minute: 59 }).toUTC().toISO();
          }
          return target.endDate;
        }
        case 'prerequisites': {
          if (!target.prerequisites) {
            return [];
          }
          const rhett = target.prerequisites.map((prereq) => {
            const data = {
              ...prereq,
              ...{
                startDate: target.startDate,
                postrequisiteName: target.name,
                postrequisiteSlug: getSlug(target),
              },
            };
            return new Proxy(data, this);
          });
          return sortBy(rhett, ['startDate', 'name']);
        }
        case 'postrequisites': {
          if (!target.postrequisites) {
            return [];
          }
          const rhett = target.postrequisites.map((postreq) => {
            return new Proxy(postreq, this);
          });
          return sortBy(rhett, ['startDate', 'name']);
        }
        case 'slug':
          return getSlug(target);
        case 'isBlanked':
          return !target.offering && !target.ilmSession;
      }
      return Reflect.get(...arguments);
    },
  };
  /**
   * Returns the session for a given event.
   * @method getSessionForEvent
   * @param {Object} event
   * @return {Promise.<Object>}
   */
  async getSessionForEvent(event) {
    let intermediary;
    if (event.offering) {
      intermediary = await this.store.findRecord('offering', event.offering);
    } else {
      intermediary = await this.store.findRecord('ilm-session', event.ilmSession);
    }
    return await intermediary.get('session');
  }

  /**
   * Returns the course for a given event.
   * @method getCourseForEvent
   * @param {Object} event
   * @return {Promise.<Object>}
   */
  async getCourseForEvent(event) {
    return await this.store.findRecord('course', event.course);
  }

  /**
   * Returns a list of vocabulary term ids for a given event.
   * @method getTermIdsForEvent
   * @param {Object} event
   * @return {Promise.<Array>}
   */
  async getTermIdsForEvent(event) {
    const session = await this.getSessionForEvent(event);
    const sessionTerms = await session.get('terms');
    const course = await session.get('course');
    const courseTerms = await course.get('terms');
    return uniqueValues(mapBy([...sessionTerms, ...courseTerms], 'id'));
  }

  /**
   * Returns the session-type id for a given event.
   * @method getSessionTypeIdForEvent
   * @param {Object} event
   * @return {Promise.<int>}
   */
  async getSessionTypeIdForEvent(event) {
    const session = await this.getSessionForEvent(event);
    const sessionType = await session.get('sessionType');
    return sessionType.get('id');
  }

  /**
   * Returns the course level for a given event.
   * @method getCourseLevelForEvent
   * @param {Object} event
   * @return {Promise.<int>}
   */
  async getCourseLevelForEvent(event) {
    const course = await this.getCourseForEvent(event);
    return course.get('level');
  }

  /**
   * Returns the course id for a given event.
   * @method getCourseIdForEvent
   * @param {Object} event
   * @return {Promise.<int>}
   */
  async getCourseIdForEvent(event) {
    const course = await this.getCourseForEvent(event);
    return course.get('id');
  }

  /**
   * Returns the cohort id for a given event.
   * @method getCohortIdsForEvent
   * @param {Object} event
   * @return {Promise.<Array>}
   */
  async getCohortIdsForEvent(event) {
    const course = await this.getCourseForEvent(event);
    const cohorts = await course.get('cohorts');
    return mapBy(cohorts, 'id');
  }

  /**
   * Parses event and does some transformation
   * @method createEventFromData
   * @param {Object} obj
   * @param {Boolean} isUserEvent TRUE if the given object represents a user event, FALSE if it represents a school event.
   * @return {Object}
   */
  createEventFromData(obj, isUserEvent) {
    obj.isUserEvent = isUserEvent;
    return new Proxy(obj, this.handler);
  }
}
