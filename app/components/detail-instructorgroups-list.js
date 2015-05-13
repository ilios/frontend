import Ember from 'ember';

export default Ember.Component.extend({
  instructorGroups: [],
  sortBy: ['title'],
  sortedInstructorGroups: Ember.computed.sort('instructorGroups', 'sortBy'),
});
