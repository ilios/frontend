import Ember from 'ember';

const { computed, Controller, inject } = Ember;
const { controller } = inject;
const { alias } = computed;

export default Controller.extend({
  programController: controller('program'),

  program: alias('programController.model'),
});
