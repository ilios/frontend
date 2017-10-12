import { inject as service } from '@ember/service';
import Component from '@ember/component';
import RSVP from 'rsvp';
import { computed } from '@ember/object';
const { Promise, all } = RSVP;

export default Component.extend({
  currentUser: service(),
  routing: service('-routing'),
  classNames: ['course-summary-header'],
  course: null,

  showRollover: computed('currentUser', 'routing.currentRouteName', function(){
    return new Promise(resolve => {
      const routing = this.get('routing');
      if (routing.get('currentRouteName') === 'course.rollover') {
        resolve(false);
      } else {
        const currentUser = this.get('currentUser');
        all([
          currentUser.get('userIsCourseDirector'),
          currentUser.get('userIsDeveloper')
        ]).then(hasRole => {
          resolve(hasRole.includes(true));
        });
      }

    });
  }),

  showMaterials: computed('routing.currentRouteName', function(){
    return new Promise(resolve => {
      const routing = this.get('routing');
      resolve(routing.get('currentRouteName') !== 'course-materials');
    });
  }),
});
