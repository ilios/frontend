import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { dropTask, restartableTask } from 'ember-concurrency';
import { hash } from 'rsvp';

export default class DetailInstructorsComponent extends Component {
  @service currentUser;
  @tracked isManaging = false;
  @tracked instructorGroupBuffer = [];
  @tracked instructorBuffer = [];
  @tracked availableInstructorGroups;

  constructor() {
    super(...arguments);
    this.load.perform();
  }

  load = restartableTask(async () => {
    const user = await this.currentUser.getModel();
    const school = await user.school;
    this.availableInstructorGroups = await school.instructorGroups;
  });

  manage = dropTask(async () => {
    const { ilmSession } = this.args;
    const { instructorGroups, instructors } = await hash({
      instructorGroups: ilmSession.instructorGroups,
      instructors: ilmSession.instructors,
    });

    this.instructorGroupBuffer = instructorGroups.toArray();
    this.instructorBuffer = instructors.toArray();
    this.isManaging = true;
  });

  save = dropTask(async () => {
    const { ilmSession } = this.args;
    ilmSession.set('instructorGroups', this.instructorGroupBuffer);
    ilmSession.set('instructors', this.instructorBuffer);
    await ilmSession.save();
    this.isManaging = false;
  });

  get instructorCount() {
    if (!this.args.ilmSession) {
      return 0;
    }
    return this.args.ilmSession.instructors.length;
  }

  get instructorGroupCount() {
    if (!this.args.ilmSession) {
      return 0;
    }
    return this.args.ilmSession.instructorGroups.length;
  }
  @action
  cancel() {
    this.instructorGroupBuffer = [];
    this.instructorBuffer = [];
    this.isManaging = false;
  }
  @action
  addInstructorGroupToBuffer(instructorGroup) {
    this.instructorGroupBuffer = [...this.instructorGroupBuffer, instructorGroup];
  }
  @action
  removeInstructorGroupFromBuffer(instructorGroup) {
    this.instructorGroupBuffer = this.instructorGroupBuffer.filter(
      (obj) => obj.id !== instructorGroup.id
    );
  }
  @action
  addInstructorToBuffer(instructor) {
    this.instructorBuffer = [...this.instructorBuffer, instructor];
  }
  @action
  removeInstructorFromBuffer(instructor) {
    this.instructorBuffer = this.instructorBuffer.filter((obj) => obj.id !== instructor.id);
  }
}
