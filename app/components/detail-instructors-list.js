/* eslint ember/order-in-components: 0 */
import Component from '@ember/component';
import { computed } from '@ember/object';
const { sort } = computed;

export default Component.extend({
  init() {
    this._super(...arguments);
    this.set('sortInstructorsBy', ['title']);
    this.set('sortGroupsBy', ['title']);
  },
  classNames: ['detail-instructors-list'],
  instructors: null,
  sortInstructorsBy: null,
  sortedInstructors: sort('instructors', 'sortInstructorsBy'),
  instructorGroups: null,
  sortGroupsBy: null,
  sortedInstructorGroups: sort('instructorGroups', 'sortGroupsBy'),
});
