import Component from '@ember/component';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';

export default Component.extend({
  classNames: ['course-search-result', 'results-row'],
  tagName: 'li',

  course: null,
  showMore: false,

  courseTags: reads('course.matchedIn'),
  sessions: reads('course.sessions'),

  computedSessions: computed('showMore', function() {
    return this.showMore ? this.sessions : this.sessions.slice(0, 3);
  })
});
