/* eslint ember/order-in-components: 0 */
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import RSVP from 'rsvp';
import { computed } from '@ember/object';
import layout from '../templates/components/course-summary-header';

const { Promise } = RSVP;


export default Component.extend({
  layout,
  currentUser: service(),
  routing: service('-routing'),
  permissionChecker: service(),
  classNames: ['course-summary-header'],
  course: null,

  showRollover: computed('course', 'currentUser', 'routing.currentRouteName', async function () {
    const routing = this.get('routing');
    if (routing.get('currentRouteName') === 'course.rollover') {
      return false;
    }
    const permissionChecker = this.get('permissionChecker');
    const course = this.get('course');
    const school = await course.get('school');
    return permissionChecker.canCreateCourse(school);
  }),

  showMaterials: computed('routing.currentRouteName', function(){
    return new Promise(resolve => {
      const routing = this.get('routing');
      resolve(routing.get('currentRouteName') !== 'course-materials');
    });
  }),
});
