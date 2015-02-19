import Ember from 'ember';

export default Ember.Component.extend({
  objectives: [],
  isCourse: false,
  isSession: Ember.computed.not('isCourse'),
  sort: ['id'],
  sortedObjectives: Ember.computed.sort('objectives', 'sort'),
});
