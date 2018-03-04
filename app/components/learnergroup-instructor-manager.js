/* eslint ember/order-in-components: 0 */
import Component from '@ember/component';
import { isPresent } from '@ember/utils';
import { computed } from '@ember/object';
import { task } from 'ember-concurrency';

const { oneWay } = computed;

export default Component.extend({
  learnerGroup: null,
  init(){
    this._super(...arguments);
    const learnerGroup = this.get('learnerGroup');
    if (isPresent(learnerGroup)) {
      learnerGroup.get('instructors').then(instructors => {
        this.set('instructors', instructors.toArray());
      });
      learnerGroup.get('instructorGroups').then(instructorGroups => {
        this.set('instructorGroups', instructorGroups.toArray());
      });
    }
  },
  availableInstructorGroups: oneWay('learnerGroup.cohort.programYear.program.school.instructorGroups'),
  saveChanges: task(function * () {
    const instructors = this.get('instructors');
    const instructorGroups = this.get('instructorGroups');
    yield this.get('save')(instructors, instructorGroups);
  }).drop(),
  actions: {
    addInstructor(user){
      this.get('instructors').pushObject(user);
    },
    addInstructorGroup(instructorGroup){
      this.get('instructorGroups').pushObject(instructorGroup);
    },
    removeInstructor(user){
      this.get('instructors').removeObject(user);
    },
    removeInstructorGroup(instructorGroup){
      this.get('instructorGroups').removeObject(instructorGroup);
    }
  }
});
