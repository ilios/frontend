import Ember from 'ember';

const { Component, computed } = Ember;
const { alias } = computed;

export default Component.extend({
  report: null,
  isFinalized: alias('report.isFinalized')
});
