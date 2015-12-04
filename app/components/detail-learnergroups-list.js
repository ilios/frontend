import Ember from 'ember';

const { Component, computed } = Ember;
const { sort } = computed;

export default Component.extend({
  learnerGroups: [],
  sortBy: ['title'],
  sortedLearnerGroups: sort('learnerGroups', 'sortBy'),
});
