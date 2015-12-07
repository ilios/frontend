import Ember from 'ember';

const { Controller, inject } = Ember;
const { controller } = inject;

export default Controller.extend({
  sessionController: controller('session'),
  courseController: controller('course')
});
