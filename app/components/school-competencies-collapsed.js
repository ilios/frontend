import Ember from 'ember';

const { Component, computed } = Ember;
const { alias } = computed;

export default Component.extend({
  school: null,
  competencies: alias('school.objectives'),
});
