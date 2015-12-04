import Ember from 'ember';

const { computed, Controller } = Ember;
const { alias } = computed;

export default Controller.extend({
  needs: ["course", "session"],
  courseController: alias("controllers.course"),
  sessionController: alias("controllers.session"),
});
