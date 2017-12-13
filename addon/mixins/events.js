import Mixin from '@ember/object/mixin';

export default Mixin.create({

  /**
   * Returns the session for a given event.
   * @method getSessionForEvent
   * @param {Object} event
   * @return {Promise.<Object>}
   */
  async getSessionForEvent(event){
    let intermediary;
    if(event.offering){
      intermediary = await this.get('store').findRecord('offering', event.offering);
    } else {
      intermediary = await this.get('store').findRecord('ilmSession', event.ilmSession);
    }
    return await intermediary.get('session');
  },

  /**
   * Returns the course for a given event.
   * @method getCourseForEvent
   * @param {Object} event
   * @return {Promise.<Object>}
   */
  async getCourseForEvent(event){
    const session = await this.getSessionForEvent(event);
    return await session.get('course');
  },

  /**
   * Returns a list of vocabulary term ids for a given event.
   * @method getTermIdsForEvent
   * @param {Object} event
   * @return {Promise.<Array>}
   */
  async getTermIdsForEvent(event){
    const terms = [];
    const session = await this.getSessionForEvent(event);
    const sessionTerms = await session.get('terms');
    const course = await session.get('course');
    const courseTerms = await course.get('terms');
    terms.pushObjects(sessionTerms.toArray());
    terms.pushObjects(courseTerms.toArray());
    return terms.mapBy('id').uniq();
  },

  /**
   * Returns the session-type id for a given event.
   * @method getSessionTypeIdForEvent
   * @param {Object} event
   * @return {Promise.<int>}
   */
  async getSessionTypeIdForEvent(event){
    const session = await this.getSessionForEvent(event);
    const sessionType = await session.get('sessionType');
    return sessionType.get('id');
  },

  /**
   * Returns the course level for a given event.
   * @method getCourseLevelForEvent
   * @param {Object} event
   * @return {Promise.<int>}
   */
  async getCourseLevelForEvent(event){
    const course = await this.getCourseForEvent(event);
    return course.get('level');
  },

  /**
   * Returns the course id for a given event.
   * @method getCourseIdForEvent
   * @param {Object} event
   * @return {Promise.<int>}
   */
  async getCourseIdForEvent(event){
    const course = await this.getCourseForEvent(event);
    return course.get('id');
  },

  /**
   * Returns the cohort id for a given event.
   * @method getCohortIdsForEvent
   * @param {Object} event
   * @return {Promise.<Array>}
   */
  async getCohortIdsForEvent(event){
    const course = await this.getCourseForEvent(event);
    const cohorts = await course.get('cohorts');
    return cohorts.toArray().mapBy('id');
  },
});
