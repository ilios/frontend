import Service from '@ember/service';
import { DateTime } from 'luxon';
import { mapBy, sortByDate, sortByString, uniqueValues } from '../utils/array-helpers';

export default class EventsBase extends Service {
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
      intermediary = await this.store.findRecord('ilmSession', event.ilmSession);
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
    const terms = [];
    const session = await this.getSessionForEvent(event);
    const sessionTerms = await session.get('terms');
    const course = await session.get('course');
    const courseTerms = await course.get('terms');
    terms.pushObjects(sessionTerms.slice());
    terms.pushObjects(courseTerms.slice());
    return uniqueValues(mapBy(terms, 'id'));
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
    return mapBy(cohorts.slice(), 'id');
  }

  /**
   * Parses event and does some transformation
   * @method createEventFromData
   * @param {Object} obj
   * @param {Boolean} isUserEvent TRUE if the given object represents a user event, FALSE if it represents a school event.
   * @return {Object}
   */
  createEventFromData(obj, isUserEvent) {
    obj.isBlanked = !obj.offering && !obj.ilmSession;
    obj.slug = isUserEvent ? this.getSlugForUserEvent(obj) : this.getSlugForSchoolEvent(obj);
    obj.prerequisites = obj.prerequisites.map((prereq) => {
      const rhett = this.createEventFromData(prereq, isUserEvent);
      rhett.startDate = obj.startDate;
      rhett.postrequisiteName = obj.name;
      rhett.postrequisiteSlug = obj.slug;

      return rhett;
    });
    obj.prerequisites = sortByDate(obj.prerequisites, 'startDate');
    obj.prerequisites = sortByString(obj.prerequisites, 'name');
    obj.postrequisites = obj.postrequisites.map((postreq) =>
      this.createEventFromData(postreq, isUserEvent)
    );
    obj.postrequisites = sortByDate(obj.postrequisites, 'startDate');
    obj.postrequisites = sortByString(obj.postrequisites, 'name');
    obj.isUserEvent = isUserEvent;
    return obj;
  }

  /**
   * Generates a slug for a given user event.
   * @method getSlugForUserEvent
   * @param {Object} event
   * @return {String}
   */
  getSlugForUserEvent(event) {
    let slug = 'U';
    slug += DateTime.fromISO(event.startDate).toFormat('yyyyMMdd');
    if (event.offering) {
      slug += 'O' + event.offering;
    }
    if (event.ilmSession) {
      slug += 'I' + event.ilmSession;
    }
    return slug;
  }

  /**
   * Generates a slug for a given school event.
   * @method getSlugForSchoolEvent
   * @param {Object} event
   * @return {String}
   */
  getSlugForSchoolEvent(event) {
    let slug = 'S';
    let schoolId = parseInt(event.school, 10).toString();
    //always use a two digit schoolId
    if (schoolId.length === 1) {
      schoolId = '0' + schoolId;
    }
    slug += schoolId;
    slug += DateTime.fromISO(event.startDate).toFormat('yyyyMMdd');
    if (event.offering) {
      slug += 'O' + event.offering;
    }
    if (event.ilmSession) {
      slug += 'I' + event.ilmSession;
    }
    return slug;
  }
}
