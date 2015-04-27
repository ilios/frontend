import Ember from 'ember';

export default Ember.Controller.extend({
  needs: "program",
  program: Ember.computed.alias("controllers.program.model"),
});
