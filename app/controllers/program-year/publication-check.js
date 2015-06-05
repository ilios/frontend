import Ember from 'ember';

export default Ember.Controller.extend({
  needs: ["program", "programYear"],
  program: Ember.computed.alias("controllers.program.model"),
  programYear: Ember.computed.alias("controllers.programYear.model"),
});
