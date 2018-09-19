/* eslint ember/order-in-components: 0 */
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import RSVP from 'rsvp';
import { computed } from '@ember/object';
const { Promise } = RSVP;

export default Component.extend({
  currentUser: service(),
  routing: service('-routing'),
  permissionChecker: service(),
  classNames: ['course-summary-header'],
  course: null,

  showRollover: computed('course', 'currentUser', 'routing.currentRouteName', async function () {
    const routing = this.routing;
    if (routing.get('currentRouteName') === 'course.rollover') {
      return false;
    }
    const permissionChecker = this.permissionChecker;
    const course = this.course;
    const school = await course.get('school');
    return permissionChecker.canCreateCourse(school);
  }),

  showMaterials: computed('routing.currentRouteName', function(){
    return new Promise(resolve => {
      const routing = this.routing;
      resolve(routing.get('currentRouteName') !== 'course-materials');
    });
  }),
});
