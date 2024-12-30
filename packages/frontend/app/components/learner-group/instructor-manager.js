import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class LearnerGroupInstructorManagerComponent extends Component {
  @tracked instructors = [];
  @tracked instructorGroups = [];

  constructor() {
    super(...arguments);
    this.instructors = this.args.instructors;
    this.instructorGroups = this.args.instructorGroups;
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
}
