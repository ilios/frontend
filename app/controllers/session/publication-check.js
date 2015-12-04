import Ember from 'ember';

const { computed, Controller, inject } = Ember;
const { controller } = inject;
const { alias } = computed;

export default Controller.extend({
  sessionController: controller('session'),
  courseController: controller('course'),

  courseController: alias('courseController'),
  sessionController: alias('sessionController')
});
