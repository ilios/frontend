import Ember from 'ember';

export default Ember.ArrayController.extend({
  needs: "course",
  course: Ember.computed.alias("controllers.course")
});
