import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';

export default Component.extend({
  currentUser: service(),

  classNames: ['dashboard-mycourses'],
  tagName: 'div',

  listOfCourses: computed('currentUser.activeRelatedCoursesInThisYearAndLastYear.[]', function() {
    return this.currentUser.get('activeRelatedCoursesInThisYearAndLastYear').then(courses => {
      return courses.sortBy('startDate');
    });
  }),

  canEditCourses: computed('currentUser.performsNonLearnerFunction', async function() {
    return this.currentUser.get('performsNonLearnerFunction');
  })
});
