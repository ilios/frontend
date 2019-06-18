import Component from '@ember/component';
import { oneWay } from '@ember/object/computed';
import { isPresent } from '@ember/utils';
import { task } from 'ember-concurrency';

export default Component.extend({
  learnerGroup: null,

  availableInstructorGroups: oneWay('learnerGroup.cohort.programYear.program.school.instructorGroups'),

  init() {
    this._super(...arguments);
    const learnerGroup = this.learnerGroup;
    if (isPresent(learnerGroup)) {
      learnerGroup.get('instructors').then(instructors => {
        this.set('instructors', instructors.toArray());
      });
      learnerGroup.get('instructorGroups').then(instructorGroups => {
        this.set('instructorGroups', instructorGroups.toArray());
      });
    }
  },

  actions: {
    addInstructor(user) {
      this.instructors.pushObject(user);
    },

    addInstructorGroup(instructorGroup) {
      this.instructorGroups.pushObject(instructorGroup);
    },

    removeInstructor(user) {
      this.instructors.removeObject(user);
    },

    removeInstructorGroup(instructorGroup) {
      this.instructorGroups.removeObject(instructorGroup);
    }
  },

  saveChanges: task(function* () {
    const instructors = this.instructors;
    const instructorGroups = this.instructorGroups;
    yield this.save(instructors, instructorGroups);
  }).drop()
});
