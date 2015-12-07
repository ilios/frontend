import Ember from 'ember';

const { computed, Controller, inject } = Ember;
const { controller } = inject;
const { alias } = computed;

export default Controller.extend({
  programYearController: controller('programYear'),
  programController: controller('program'),

  program: alias('programController.model'),
  programYear: alias('programYearController.model')
});
