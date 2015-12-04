import Ember from 'ember';

const { Component, computed } = Ember;
const { sort } = computed;

export default Component.extend({
  instructors: [],
  sortInstructorsBy: ['title'],
  sortedInstructors: sort('instructors', 'sortInstructorsBy'),
  instructorGroups: [],
  sortGroupsBy: ['title'],
  sortedInstructorGroups: sort('instructorGroups', 'sortGroupsBy'),
});
