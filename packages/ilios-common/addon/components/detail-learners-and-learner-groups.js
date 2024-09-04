import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { dropTask } from 'ember-concurrency';
import { hash } from 'rsvp';
import { uniqueValues } from 'ilios-common/utils/array-helpers';
import { TrackedAsyncData } from 'ember-async-data';

export default class DetailLearnersAndLearnerGroupsComponent extends Component {
  @service currentUser;
  @tracked isManaging = false;
  @tracked learnerGroupBuffer = [];
  @tracked learnerBuffer = [];

  @cached
  get ilmSessionData() {
    return new TrackedAsyncData(this.args.session.ilmSession);
  }

  @cached
  get courseData() {
    return new TrackedAsyncData(this.args.session.course);
  }

  @cached
  get cohortsData() {
    return new TrackedAsyncData(this.course?.cohorts);
  }

  @cached
  get ilmLearnersData() {
    return new TrackedAsyncData(this.ilmSession?.learners);
  }

  @cached
  get ilmLearnerGroupsData() {
    return new TrackedAsyncData(this.ilmSession?.learnerGroups);
  }

  get ilmSession() {
    return this.ilmSessionData.isResolved ? this.ilmSessionData.value : null;
  }

  get course() {
    return this.courseData.isResolved ? this.courseData.value : null;
  }

  get cohorts() {
    return this.cohortsData.isResolved ? this.cohortsData.value : null;
  }

  get ilmLearners() {
    return this.ilmLearnersData.isResolved ? this.ilmLearnersData.value : null;
  }

  get ilmLearnerGroups() {
    return this.ilmLearnerGroupsData.isResolved ? this.ilmLearnerGroupsData.value : null;
  }

  manage = dropTask(async () => {
    const ilmSession = await this.args.session.ilmSession;
    const { learnerGroups, learners } = await hash({
      learnerGroups: ilmSession.learnerGroups,
      learners: ilmSession.learners,
    });

    this.learnerGroupBuffer = learnerGroups;
    this.learnerBuffer = learners;
    this.isManaging = true;
  });

  save = dropTask(async () => {
    const ilmSession = await this.args.session.ilmSession;
    ilmSession.set('learnerGroups', this.learnerGroupBuffer);
    ilmSession.set('learners', this.learnerBuffer);
    await ilmSession.save();
    this.isManaging = false;
  });

  get learnerCount() {
    if (!this.ilmSession) {
      return 0;
    }
    return this.ilmSession.learners.length;
  }

  get learnerGroupCount() {
    if (!this.ilmSession) {
      return 0;
    }
    return this.ilmSession.learnerGroups.length;
  }

  get selectedIlmLearners() {
    if (!this.ilmLearners) {
      return [];
    }
    return this.ilmLearners;
  }

  get selectedIlmLearnerGroups() {
    if (!this.ilmLearnerGroups) {
      return [];
    }
    return this.ilmLearnerGroups;
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
      this.learnerGroupBuffer.filter((g) => !groupsToRemove.includes(g)),
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
