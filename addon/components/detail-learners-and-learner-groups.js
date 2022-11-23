import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { dropTask } from 'ember-concurrency';
import { hash } from 'rsvp';
import { uniqueValues } from '../utils/array-helpers';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';
import { use } from 'ember-could-get-used-to-this';

export default class DetailLearnersAndLearnerGroupsComponent extends Component {
  @service currentUser;
  @tracked isManaging = false;
  @tracked learnerGroupBuffer = [];
  @tracked learnerBuffer = [];
  @use ilmLearners = new ResolveAsyncValue(() => [this.args.ilmSession?.learners]);
  @use ilmLearnerGroups = new ResolveAsyncValue(() => [this.args.ilmSession?.learnerGroups]);

  manage = dropTask(async () => {
    const { ilmSession } = this.args;
    const { learnerGroups, learners } = await hash({
      learnerGroups: ilmSession.learnerGroups,
      learners: ilmSession.learners,
    });

    this.learnerGroupBuffer = learnerGroups.slice();
    this.learnerBuffer = learners.slice();
    this.isManaging = true;
  });

  save = dropTask(async () => {
    const { ilmSession } = this.args;
    ilmSession.set('learnerGroups', this.learnerGroupBuffer);
    ilmSession.set('learners', this.learnerBuffer);
    await ilmSession.save();
    this.isManaging = false;
  });

  get learnerCount() {
    if (!this.args.ilmSession) {
      return 0;
    }
    return this.args.ilmSession.learners.length;
  }

  get learnerGroupCount() {
    if (!this.args.ilmSession) {
      return 0;
    }
    return this.args.ilmSession.learnerGroups.length;
  }

  get selectedIlmLearners() {
    if (!this.ilmLearners) {
      return [];
    }
    return this.ilmLearners.toArray();
  }

  get selectedIlmLearnerGroups() {
    if (!this.ilmLearnerGroups) {
      return [];
    }
    return this.ilmLearnerGroups.toArray();
  }

  @action
  cancel() {
    this.learnerGroupBuffer = [];
    this.learnerBuffer = [];
    this.isManaging = false;
  }

  @action
  async addLearnerGroupToBuffer(learnerGroup, cascade) {
    if (cascade) {
      const descendants = await learnerGroup.getAllDescendants();
      this.learnerGroupBuffer = uniqueValues([
        ...this.learnerGroupBuffer,
        ...descendants,
        learnerGroup,
      ]);
    } else {
      this.learnerGroupBuffer = uniqueValues([...this.learnerGroupBuffer, learnerGroup]);
    }
  }

  @action
  async removeLearnerGroupFromBuffer(learnerGroup, cascade) {
    let groupsToRemove = [learnerGroup];
    if (cascade) {
      const descendants = await learnerGroup.getAllDescendants();
      groupsToRemove = [...descendants, learnerGroup];
    }
    this.learnerGroupBuffer = uniqueValues(
      this.learnerGroupBuffer.filter((g) => !groupsToRemove.includes(g))
    );
  }

  @action
  addLearnerToBuffer(learner) {
    this.learnerBuffer = [...this.learnerBuffer, learner];
  }
  @action
  removeLearnerFromBuffer(learner) {
    this.learnerBuffer = this.learnerBuffer.filter((obj) => obj.id !== learner.id);
  }
}
