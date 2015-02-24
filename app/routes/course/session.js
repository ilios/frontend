import Ember from 'ember';

export default Ember.Route.extend({
  sessionTypes: [],
  afterModel: function(){
    //fetch all the session types from the store, but don't wait on them returning
    var sessionTypes = this.store.filter('sessionType', {}, function(){
      return true;
    });

    this.set('sessionTypes', sessionTypes);
  },
  setupController: function(controller, model){
    controller.set('model', model);
    controller.set('sessionTypes', this.get('sessionTypes'));
    this.controllerFor('course').set('showBackToCourseListLink', false);
  }
});
