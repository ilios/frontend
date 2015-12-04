import Ember from 'ember';

const { computed, Controller } = Ember;
const { alias } = computed;

export default Controller.extend({
  needs: "program",
  program: alias("controllers.program.model"),
});
