import Ember from 'ember';

const { computed, Controller } = Ember;
const { not } = computed;

export default Controller.extend({
  queryParams: ['details', 'courseObjectiveDetails'],

  details: false,
  courseObjectiveDetails: false,

  // Pass the state var that ilios-course-details expects
  collapsed: not('details'),

  actions: {
    collapsedState(state) {
      // We have reveresed verb collapsed/details so reverse the passed state
      this.set('details', !state);
    },
  }
});
