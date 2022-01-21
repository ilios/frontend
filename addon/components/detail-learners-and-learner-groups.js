import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { dropTask } from 'ember-concurrency';
import { hash } from 'rsvp';

export default class DetailLearnersAndLearnerGroupsComponent extends Component {
  @service currentUser;
  @tracked isManaging = false;
  @tracked learnerGroupBuffer = [];
  @tracked learnerBuffer = [];

  @dropTask
  *manage() {
    const { ilmSession } = this.args;
    const { learnerGroups, learners } = yield hash({
      learnerGroups: ilmSession.learnerGroups,
      learners: ilmSession.learners,
    });

    this.learnerGroupBuffer = learnerGroups.toArray();
    this.learnerBuffer = learners.toArray();
    this.isManaging = true;
  }
  @dropTask
  *save() {
    const { ilmSession } = this.args;
    ilmSession.set('learnerGroups', this.learnerGroupBuffer);
    ilmSession.set('learners', this.learnerBuffer);
    yield ilmSession.save();
    this.isManaging = false;
  }

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
  @action
  cancel() {
    this.learnerGroupBuffer = [];
    this.learnerBuffer = [];
    this.isManaging = false;
  }

  @action
  async addLearnerGroupToBuffer(learnerGroup) {
    const descendants = await learnerGroup.get('allDescendants');
    this.learnerGroupBuffer = [...this.learnerGroupBuffer, ...descendants, learnerGroup];
  }

  @action
  async removeLearnerGroupFromBuffer(learnerGroup) {
    const descendants = await learnerGroup.get('allDescendants');
    const groupsToRemove = [...descendants, learnerGroup];
    this.learnerGroupBuffer = this.learnerGroupBuffer.filter((g) => !groupsToRemove.includes(g));
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
