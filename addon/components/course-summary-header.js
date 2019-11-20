import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  currentUser: service(),
  permissionChecker: service(),
  router: service(),

  classNames: ['course-summary-header'],
  course: null,

  showRollover: computed('course', 'currentUser', 'router.currentRouteName', async function () {
    if (this.router.currentRouteName === 'course.rollover') {
      return false;
    }

    const permissionChecker = this.get('permissionChecker');
    const course = this.get('course');
    const school = await course.get('school');
    return permissionChecker.canCreateCourse(school);
  }),

  showMaterials: computed('router.currentRouteName', function() {
    return this.router.currentRouteName !== 'course-materials';
  })
});
