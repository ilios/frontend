import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { computed } from '@ember/object';
import { all } from 'rsvp';
import layout from '../templates/components/instructor-selection-manager';

export default Component.extend({
  intl: service(),
  layout,
  instructors: null,
  availableInstructorGroups: null,
  classNames: ['instructor-selection-manager'],
  tagName: 'section',
  instructorGroups: null,
  'data-test-instructor-selection-manager': true,

  instructorGroupMembers: computed('instructorGroups.[]', async function() {
    const groupsOfInstructors = await all(this.instructorGroups.mapBy('users'));
    return groupsOfInstructors.reduce((array, set) => {
      array.pushObjects(set.toArray());
      return array;
    }, []).uniq().sortBy('fullName');
  }),

  actions: {
    addInstructor(user){
      this.addInstructor(user);
    },
    addInstructorGroup(group){
      this.addInstructorGroup(group);
    },
    removeInstructor(user){
      this.removeInstructor(user);
    },
    removeInstructorGroup(group){
      this.removeInstructorGroup(group);
    },
  }
});
