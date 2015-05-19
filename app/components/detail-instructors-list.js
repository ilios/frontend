import Ember from 'ember';

export default Ember.Component.extend({
  instructors: [],
  sortInstructorsBy: ['title'],
  sortedInstructors: Ember.computed.sort('instructors', 'sortInstructorsBy'),
  instructorGroups: [],
  sortGroupsBy: ['title'],
  sortedInstructorGroups: Ember.computed.sort('instructorGroups', 'sortGroupsBy'),
});
