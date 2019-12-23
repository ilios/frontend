import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { dropTask, enqueueTask, restartableTask } from 'ember-concurrency-decorators';
import { timeout } from 'ember-concurrency';

export default class DetailLearnerGroupsComponent extends Component {
  @tracked learnerGroups;

  @restartableTask
  *load() {
    if (!this.args.ilmSession) {
      return;
    }
    this.learnerGroups = yield (this.args.ilmSession.learnerGroups).toArray();
  }
  get collapsible(){
    return this.learnerGroups && this.learnerGroups.length && !this.args.isManaging;
  }

  @action
  cancel(){
    this.load.perform();
    this.args.setIsManaging(false);
  }
  @enqueueTask
  *addLearnerGroup(learnerGroup) {
    const descendants = yield learnerGroup.allDescendants;
    this.learnerGroups = [...this.learnerGroups, learnerGroup, ...descendants];
  }
  @enqueueTask
  *removeLearnerGroup(learnerGroup) {
    const descendants = yield learnerGroup.allDescendants;
    const descendantIds = descendants.mapBy('id');
    this.learnerGroups = this.learnerGroups.filter(({ id }) => {
      return !descendantIds.includes(id) && id !== learnerGroup.id;
    });
  }

  @action
  collapse() {
    if (this.collapsible) {
      this.args.collapse();
    }
  }
  @dropTask
  *save(){
    yield timeout(10);
    this.args.ilmSession.set('learnerGroups', this.learnerGroups);
    try {
      yield this.args.ilmSession.save();
    } finally {
      this.args.setIsManaging(false);
      this.args.expand();
    }
  }
}
