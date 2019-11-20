import { inject as service } from '@ember/service';
import Component from '@ember/component';

export default Component.extend({
  intl: service(),
  instructors: null,
  availableInstructorGroups: null,
  classNames: ['instructor-selection-manager'],
  tagName: 'section',
  instructorGroups: null,
  'data-test-instructor-selection-manager': true,

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
