import Ember from 'ember';

const { computed, Controller } = Ember;
const { alias } = computed;

export default Controller.extend({
  needs: ["program", "programYear"],
  program: alias("controllers.program.model"),
  programYear: alias("controllers.programYear.model"),
});
