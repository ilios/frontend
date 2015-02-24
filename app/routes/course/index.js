import Ember from 'ember';

export default  Ember.Route.extend({
  model: function() {
    return Ember.RSVP.hash({
      course: this.modelFor('course'),
      sessions: this.modelFor('course').get('sessions')
    });
  },
  setupController: function(controller,hash){
    controller.set('course', hash.course);
    controller.set('model', hash.sessions);
  }
});
