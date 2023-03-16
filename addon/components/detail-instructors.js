import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { dropTask, restartableTask } from 'ember-concurrency';
import { hash } from 'rsvp';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';
import { use } from 'ember-could-get-used-to-this';

export default class DetailInstructorsComponent extends Component {
  @service currentUser;
  @tracked isManaging = false;
  @tracked instructorGroupBuffer = [];
  @tracked instructorBuffer = [];
  @tracked availableInstructorGroups;
  @use ilmSession = new ResolveAsyncValue(() => [this.args.session.ilmSession]);
  @use ilmInstructors = new ResolveAsyncValue(() => [this.ilmSession?.instructors]);
  @use ilmInstructorGroups = new ResolveAsyncValue(() => [this.ilmSession?.instructorGroups]);

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

    this.instructorGroupBuffer = instructorGroups.slice();
    this.instructorBuffer = instructors.slice();
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
    return this.ilmInstructors.toArray();
  }

  get selectedIlmInstructorGroups() {
    if (!this.ilmInstructorGroups) {
      return [];
    }
    return this.ilmInstructorGroups.toArray();
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
