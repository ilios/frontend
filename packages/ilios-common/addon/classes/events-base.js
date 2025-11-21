import Service from '@ember/service';
import { mapBy, uniqueValues } from 'ilios-common/utils/array-helpers';

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
}
