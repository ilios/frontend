import Ember from 'ember';

export default Ember.Route.extend({
  model: function(params){
    var promises = {
      course: this.store.find('course', params.course_id),
      objective: this.store.find('objective', params.objective_id)
    };
    return Ember.RSVP.hash(promises);
  },
  setupController(controller, hash){
    controller.set('course', hash.course);
    controller.set('model', hash.objective);
  }
});
