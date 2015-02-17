import Ember from 'ember';

export default Ember.Component.extend({
  objectives: [],
  sort: ['id'],
  sortedObjectives: Ember.computed.sort('objectives', 'sort'),
});
