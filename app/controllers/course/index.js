import Ember from 'ember';

export default Ember.Controller.extend({
  needs: "course",
  course: Ember.computed.alias("controllers.course.model"),
  actions: {
    openSession: function(course, session){
      this.transitionToRoute('session.index', course, session);
    }
  }
});
