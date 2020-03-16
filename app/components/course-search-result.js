import Component from '@ember/component';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';

export default Component.extend({
  tagName: "",
  course: null,
  showMore: false,
  courseTags: reads('course.matchedIn'),

  sessions: computed('showMore', function() {
    const sessions = this.course.sessions;
    return this.showMore ? sessions : sessions.slice(0, 3);
  })
});
