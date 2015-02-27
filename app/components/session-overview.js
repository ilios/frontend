import Ember from 'ember';

export default Ember.Component.extend({
  editable: true,
  sortTypes: ['title'],
  sessionTypes: [],
  sortedSessionTypes: Ember.computed.sort('sessionTypes', 'sortTypes'),
  sessionTypeOptions: Ember.computed.mapBy('sortedSessionTypes', 'title'),
});
