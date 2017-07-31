import Component from '@ember/component';
import { computed } from '@ember/object';
const { sort } = computed;

export default Component.extend({
  instructors: [],
  sortInstructorsBy: ['title'],
  sortedInstructors: sort('instructors', 'sortInstructorsBy'),
  instructorGroups: [],
  sortGroupsBy: ['title'],
  sortedInstructorGroups: sort('instructorGroups', 'sortGroupsBy'),
});
