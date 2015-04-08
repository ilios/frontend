import Ember from 'ember';

export default Ember.Component.extend({
  learnerGroups: [],
  sortBy: ['title'],
  sortedLearnerGroups: Ember.computed.sort('learnerGroups', 'sortBy'),
});
