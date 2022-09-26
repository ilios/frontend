import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { isPresent } from '@ember/utils';
import { dropTask, restartableTask } from 'ember-concurrency';

export default class LearnergroupInstructorManager extends Component {
  @tracked availableInstructorGroups = [];
  @tracked instructors = [];
  @tracked instructorGroups = [];
  @tracked isManaging = false;

  load = restartableTask(async (element, [learnerGroup]) => {
    if (isPresent(learnerGroup)) {
      const instructors = await learnerGroup.get('instructors');
      const instructorGroups = await learnerGroup.get('instructorGroups');
      const cohort = await learnerGroup.get('cohort');
      const programYear = await cohort.get('programYear');
      const program = await programYear.get('program');
      const school = await program.get('school');
      const availableInstructorGroups = await school.get('instructorGroups');

      this.instructors = instructors.slice();
      this.instructorGroups = instructorGroups.slice();
      this.availableInstructorGroups = availableInstructorGroups.slice();
    }
  });

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

  saveChanges = dropTask(async () => {
    await this.args.save(this.instructors, this.instructorGroups);
    this.isManaging = false;
  });
}
