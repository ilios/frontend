import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';

export default Component.extend({
  router: service(),

  classNames: ['course-publicationcheck'],

  course: null,

  showUnlinkIcon: computed('course.objectives.[]', function() {
    const objectives = this.course.objectives;
    return objectives.any((objective) => isEmpty(objective.parents));
  }),

  actions: {
    transitionToCourse() {
      const queryParams = { courseObjectiveDetails: true, details: true };
      this.router.transitionTo('course', this.course, { queryParams });
    }
  }
});
