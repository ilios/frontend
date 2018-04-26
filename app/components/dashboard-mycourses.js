/* eslint ember/order-in-components: 0 */
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  currentUser: service(),
  tagName: 'div',
  classNames: ['dashboard-mycourses'],
  listOfCourses: computed('currentUser.activeRelatedCoursesInThisYearAndLastYear.[]', function(){
    return this.get('currentUser').get('activeRelatedCoursesInThisYearAndLastYear').then(courses => {
      return courses.sortBy('startDate');
    });
  }),
  canEditCourses: computed('currentUser.performsNonLearnerFunction', async function(){
    const currentUser = this.get('currentUser');
    return currentUser.get('performsNonLearnerFunction');
  }),
});
