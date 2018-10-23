/* eslint ember/order-in-components: 0 */
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { computed } from '@ember/object';
import { map } from 'rsvp';
import { task, timeout } from 'ember-concurrency';
import layout from '../templates/components/course-sessions';

export default Component.extend({
  layout,
  intl: service(),
  permissionChecker: service(),
  tagName: 'section',
  classNames: ['course-sessions'],
  'data-test-course-sessions': true,

  course: null,
  canCreateSession: false,
  canUpdateCourse: false,
  sortBy: null,
  filterBy: null,
  expandedSessionIds: null,
  sessionsCount: computed('course.sessions.[]', function(){
    const course = this.get('course');
    const sessionIds = course.hasMany('sessions').ids();

    return sessionIds.length;
  }),
  sessions: computed('course.sessions.[]', async function () {
    const course = this.get('course');
    return await course.get('sessions');
  }),
  sessionsWithOfferings: computed('sessions.[]', async function () {
    const sessions = await this.get('sessions');
    return sessions.filter(session => {
      const ids = session.hasMany('offerings').ids();
      return ids.length > 0;
    });
  }),
  sessionObjects: computed('course', 'sessions.[]', async function(){
    const intl = this.get('intl');
    const permissionChecker = this.get('permissionChecker');
    const course = this.get('course');
    const sessions = await this.get('sessions');
    const sessionObjects = await map(sessions.toArray(), async session => {
      const canDelete = await permissionChecker.canDeleteSession(session);
      const canUpdate = await permissionChecker.canUpdateSession(session);
      let sessionObject = {
        session,
        course,
        canDelete,
        canUpdate,
        id: session.get('id'),
        title: session.get('title'),
        instructionalNotes: session.get('instructionalNotes'),
        isPublished: session.get('isPublished'),
        isNotPublished: session.get('isNotPublished'),
        isScheduled: session.get('isScheduled'),
      };
      const sessionType = await session.get('sessionType');
      sessionObject.sessionTypeTitle = sessionType.get('title');
      const ilmSession = await session.get('ilmSession');
      if (ilmSession) {
        sessionObject.isIlm = true;
        sessionObject.firstOfferingDate = ilmSession.get('dueDate');
      } else {
        sessionObject.isIlm = false;
        const firstOfferingDate = await session.get('firstOfferingDate');
        sessionObject.firstOfferingDate = firstOfferingDate;
      }
      const offerings = await session.get('offerings');
      sessionObject.offeringCount = offerings.length;
      sessionObject.objectiveCount = session.hasMany('objectives').ids().length;
      sessionObject.termCount = session.hasMany('terms').ids().length;
      const offeringLearerGroupCount = offerings.reduce((total, offering) => {
        let count = offering.hasMany('learnerGroups').ids().length;

        return total + count;
      }, 0);
      let ilmLearnerGroupCount = 0;
      if (ilmSession) {
        const learnerGroupIds = ilmSession.hasMany('learnerGroups').ids();
        ilmLearnerGroupCount = learnerGroupIds.length;
      }
      const learnerGroupCount = offeringLearerGroupCount + ilmLearnerGroupCount;
      sessionObject.learnerGroupCount = learnerGroupCount;
      let status = intl.t('general.notPublished');
      if(session.get('isPublished')){
        sessionObject.isPublished = true;
        status = intl.t('general.published');
      }
      if(session.get('publishedAsTbd')){
        sessionObject.publishedAsTbd = true;
        status = intl.t('general.scheduled');
      }
      sessionObject.status = status.toString();
      sessionObject.searchString = sessionObject.title + sessionObject.sessionTypeTitle + sessionObject.status;

      return sessionObject;
    });

    return sessionObjects;
  }),

  saveSession: task(function * (session) {
    const course = this.get('course');
    session.set('course', course);

    return yield session.save();
  }),

  expandSession: task(function * (session) {
    yield timeout(1);
    this.expandedSessionIds.pushObject(session.id);
  }),

  closeSession: task(function * (session) {
    yield timeout(1);
    this.expandedSessionIds.removeObject(session.id);
  }),

  toggleExpandAll: task(function * () {
    const sessionsWithOfferings = yield this.get('sessionsWithOfferings');
    if (this.expandedSessionIds.length === sessionsWithOfferings.length) {
      this.set('expandedSessionIds', []);
    } else {
      const ids = sessionsWithOfferings.mapBy('id');
      this.set('expandedSessionIds', ids);
    }
  }).drop(),

  sessionTypes: computed('course.school.sessionTypes.[]', async function(){
    const course = this.get('course');
    const school = await course.get('school');
    const sessionTypes = await school.get('sessionTypes');

    return sessionTypes;
  }),

  filterByDebounced: computed('filterByLocalCache', 'filterBy', function(){
    const filterBy = this.get('filterBy');
    const filterByLocalCache = this.get('filterByLocalCache');
    const changeFilterBy = this.get('changeFilterBy');

    if (changeFilterBy.get('isIdle')) {
      return filterBy;
    }

    return filterByLocalCache;
  }),

  init() {
    this._super(...arguments);
    this.set('expandedSessionIds', []);
  },

  changeFilterBy: task(function * (value){
    const setFilterBy = this.get('setFilterBy');
    this.set('filterByLocalCache', value);
    yield timeout(250);
    setFilterBy(value);
  }).restartable(),
});
