/* eslint ember/order-in-components: 0 */
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { computed } from '@ember/object';
import RSVP from 'rsvp';
const { all } = RSVP;

import config from 'ilios/config/environment';
const { IliosFeatures: { enforceRelationshipCapabilityPermissions } } = config;

export default Component.extend({
  currentUser: service(),
  tagName: 'div',
  classNames: ['dashboard-mycourses'],
  listOfCourses: computed('currentUser.activeRelatedCoursesInThisYearAndLastYear.[]', function(){
    return this.get('currentUser').get('activeRelatedCoursesInThisYearAndLastYear').then(courses => {
      return courses.sortBy('startDate');
    });
  }),
  canEditCourses: computed(
    'currentUser.userIsCourseDirector',
    'currentUser.userIsFaculty',
    'currentUser.userIsDeveloper',
    'currentUser.performsNonLearnerFunction',
    async function(){
      const currentUser = this.get('currentUser');
      if (!enforceRelationshipCapabilityPermissions) {
        const roles = await all([
          currentUser.get('userIsCourseDirector'),
          currentUser.get('userIsFaculty'),
          currentUser.get('userIsDeveloper')
        ]);

        return roles.includes(true);
      }

      return currentUser.get('performsNonLearnerFunction');
    }),
});
