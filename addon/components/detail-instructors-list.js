import Component from '@ember/component';
import { computed } from '@ember/object';

const { sort } = computed;

export default Component.extend({
  classNames: ['detail-instructors-list'],
  instructors: null,
  sortInstructorsBy: null,
  instructorGroups: null,
  sortGroupsBy: null,
  sortedInstructors: sort('instructors', 'sortInstructorsBy'),
  sortedInstructorGroups: sort('instructorGroups', 'sortGroupsBy'),
  init() {
    this._super(...arguments);
    this.set('sortInstructorsBy', ['title']);
    this.set('sortGroupsBy', ['title']);
  },
});
