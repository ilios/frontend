import Ember from 'ember';

export default Ember.Controller.extend({
  needs: "course",
  course: Ember.computed.alias("controllers.course")
});
