import Ember from 'ember';

export default Ember.Component.extend({
  sortTypes: ['title'],
  sortedSessionTypes: Ember.computed.sort('sessionTypes', 'sortTypes'),
  sessionTypeOptions: Ember.computed.mapBy('sortedSessionTypes', 'title'),
});
