/* eslint ember/order-in-components: 0 */
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { computed } from '@ember/object';
import { map } from 'rsvp';
import { task } from 'ember-concurrency';

import config from 'ilios/config/environment';
const { IliosFeatures: { enforceRelationshipCapabilityPermissions } } = config;

export default Component.extend({
  i18n: service(),
  permissionChecker: service(),
  tagName: 'section',
  classNames: ['course-sessions'],

  course: null,
  canCreateSession: false,
  canUpdateCourse: false,
  sortBy: null,
  filterBy: null,
  sessionsCount: computed('course.sessions.[]', function(){
    const course = this.get('course');
    const sessionIds = course.hasMany('sessions').ids();

    return sessionIds.length;
  }),
  sessionObjects: computed('course.sessions.[]', async function(){
    const i18n = this.get('i18n');
    const permissionChecker = this.get('permissionChecker');
    const course = this.get('course');
    const sessions = await course.get('sessions');
    const sessionObjects = await map(sessions.toArray(), async session => {
      const canDelete = enforceRelationshipCapabilityPermissions?await permissionChecker.canDeleteSession(session):true;
      let sessionObject = {
        session,
        course,
        canDelete,
        id: session.get('id'),
        title: session.get('title'),
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
      let status = i18n.t('general.notPublished');
      if(session.get('isPublished')){
        sessionObject.isPublished = true;
        status = i18n.t('general.published');
      }
      if(session.get('publishedAsTbd')){
        sessionObject.publishedAsTbd = true;
        status = i18n.t('general.scheduled');
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

  sessionTypes: computed('course.school.sessionTypes.[]', async function(){
    const course = this.get('course');
    const school = await course.get('school');
    const sessionTypes = await school.get('sessionTypes');

    return sessionTypes;
  }),
});
