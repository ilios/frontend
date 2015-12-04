import Ember from 'ember';

const { computed, Controller, inject } = Ember;
const { alias } = computed;
const { controller } = inject;

export default Controller.extend({
  programController: controller('program'),

  program: alias('programController.model'),
});
