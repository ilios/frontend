import Ember from 'ember';

export default Ember.Route.extend({
  setupController: function(){
    this.controllerFor('course').set('showBackToCourseListLink', false);
  }
});
