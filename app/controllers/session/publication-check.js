import Ember from 'ember';

export default Ember.Controller.extend({
  needs: ["course", "session"],
  courseController: Ember.computed.alias("controllers.course"),
  sessionController: Ember.computed.alias("controllers.session"),
});
