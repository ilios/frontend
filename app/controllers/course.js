import Ember from 'ember';

export default Ember.Controller.extend({
  queryParams: ['details'],
  availableTopics: [],
  details: false,
  showBackToCourseListLink: true,
  //pass the state var that ilios-course-details expects
  collapsed: Ember.computed.not('details'),
  actions: {
    collapsedState: function(state){
      //we have reveresed verb collapsed/details so reverse the passed state
      this.set('details', !state);
    }
  }
});
