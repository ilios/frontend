import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { isPresent } from '@ember/utils';
import { dropTask, restartableTask } from 'ember-concurrency';

export default class LearnerGroupInstructorManagerComponent extends Component {
  @tracked availableInstructorGroups = [];
  @tracked instructors = [];
  @tracked instructorGroups = [];
  @tracked isManaging = false;

  @restartableTask
  *load(element, [learnerGroup]) {
    if (isPresent(learnerGroup)) {
      const instructors = yield learnerGroup.get('instructors');
      const instructorGroups = yield learnerGroup.get('instructorGroups');
      const cohort = yield learnerGroup.get('cohort');
      const programYear = yield cohort.get('programYear');
      const program = yield programYear.get('program');
      const school = yield program.get('school');
      const availableInstructorGroups = yield school.get('instructorGroups');

      this.instructors = instructors.slice();
      this.instructorGroups = instructorGroups.slice();
      this.availableInstructorGroups = availableInstructorGroups.slice();
    }
  }

  @action
  addInstructor(user) {
    this.instructors = [...this.instructors, user];
  }

  @action
  addInstructorGroup(instructorGroup) {
    this.instructorGroups = [...this.instructorGroups, instructorGroup];
  }

  @action
  removeInstructor(user) {
    this.instructors = this.instructors.filter((instructor) => instructor !== user);
  }

  @action
  removeInstructorGroup(instructorGroup) {
    this.instructorGroups = this.instructorGroups.filter((group) => group !== instructorGroup);
  }

  @dropTask
  *saveChanges() {
    yield this.args.save(this.instructors, this.instructorGroups);
    this.isManaging = false;
  }
}
