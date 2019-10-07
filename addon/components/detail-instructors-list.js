import Component from '@ember/component';
import { computed } from '@ember/object';
import layout from '../templates/components/detail-instructors-list';
import { all } from 'rsvp';

const { sort } = computed;

export default Component.extend({
  layout,
  classNames: ['detail-instructors-list'],
  instructors: null,
  sortInstructorsBy: null,
  instructorGroups: null,
  sortGroupsBy: null,
  sortedInstructors: sort('instructors', 'sortInstructorsBy'),
  sortedInstructorGroups: sort('instructorGroups', 'sortGroupsBy'),
  instructorGroupMembers: computed('instructorGroups.[]', async function() {
    const instructorGroups = await this.instructorGroups;
    const groupsOfInstructors = await all(instructorGroups.mapBy('users'));
    return groupsOfInstructors.reduce((array, set) => {
      array.pushObjects(set.toArray());
      return array;
    }, []).uniq().sortBy('fullName');
  }),
  init() {
    this._super(...arguments);
    this.set('sortInstructorsBy', ['title']);
    this.set('sortGroupsBy', ['title']);
  },
});
