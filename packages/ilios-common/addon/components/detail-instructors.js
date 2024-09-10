import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { dropTask, restartableTask } from 'ember-concurrency';
import { hash } from 'rsvp';
import { TrackedAsyncData } from 'ember-async-data';

export default class DetailInstructorsComponent extends Component {
  @service currentUser;
  @tracked isManaging = false;
  @tracked instructorGroupBuffer = [];
  @tracked instructorBuffer = [];
  @tracked availableInstructorGroups;

  @cached
  get ilmSessionData() {
    return new TrackedAsyncData(this.args.session.ilmSession);
  }

  @cached
  get ilmInstructorsData() {
    return new TrackedAsyncData(this.ilmSession?.instructors);
  }

  @cached
  get ilmInstructorGroupsData() {
    return new TrackedAsyncData(this.ilmSession?.instructorGroups);
  }

  get ilmSession() {
    return this.ilmSessionData.isResolved ? this.ilmSessionData.value : null;
  }

  get ilmInstructors() {
    return this.ilmInstructorsData.isResolved ? this.ilmInstructorsData.value : null;
  }

  get ilmInstructorGroups() {
    return this.ilmInstructorGroupsData.isResolved ? this.ilmInstructorGroupsData.value : null;
  }

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
    const ilmSession = await this.args.session.ilmSession;
    const { instructorGroups, instructors } = await hash({
      instructorGroups: ilmSession.instructorGroups,
      instructors: ilmSession.instructors,
    });

    this.instructorGroupBuffer = instructorGroups;
    this.instructorBuffer = instructors;
    this.isManaging = true;
  });

  save = dropTask(async () => {
    const ilmSession = await this.args.session.ilmSession;
    ilmSession.set('instructorGroups', this.instructorGroupBuffer);
    ilmSession.set('instructors', this.instructorBuffer);
    await ilmSession.save();
    this.isManaging = false;
  });

  get instructorCount() {
    if (!this.ilmSession) {
      return 0;
    }
    return this.ilmSession.instructors.length;
  }

  get selectedIlmInstructors() {
    if (!this.ilmInstructors) {
      return [];
    }
    return this.ilmInstructors;
  }

  get selectedIlmInstructorGroups() {
    if (!this.ilmInstructorGroups) {
      return [];
    }
    return this.ilmInstructorGroups;
  }

  get instructorGroupCount() {
    if (!this.ilmSession) {
      return 0;
    }
    return this.ilmSession.instructorGroups.length;
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
      (obj) => obj.id !== instructorGroup.id,
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
