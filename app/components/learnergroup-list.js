import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency-decorators';

export default class LearnerGroupListComponent extends Component {
  @tracked learnerGroupsForCopy = [];
  @tracked learnerGroupsForRemovalConfirmation = [];
  @tracked localSortBy = 'title';

  get sortBy() {
    return this.args.sortBy ?? this.localSortBy;
  }

  get sortedAscending(){
    return this.sortBy.search(/desc/) === -1;
  }

  @action
  cancelRemove(learnerGroup) {
    this.learnerGroupsForRemovalConfirmation = this.learnerGroupsForRemovalConfirmation.filter(lg => lg !== learnerGroup);
  }

  @action
  confirmRemove(learnerGroup) {
    if (this.args.canDelete) {
      this.learnerGroupsForRemovalConfirmation = [...this.learnerGroupsForRemovalConfirmation, learnerGroup];
    }
  }

  @action
  cancelCopy(learnerGroup) {
    this.learnerGroupsForCopy = this.learnerGroupsForCopy.filter(lg => lg !== learnerGroup);
  }

  @action
  startCopy(learnerGroup) {
    this.learnerGroupsForCopy = [...this.learnerGroupsForCopy, learnerGroup];
  }

  @task
  *copy(withLearners, learnerGroup) {
    yield this.args.copy(withLearners, learnerGroup);
    this.cancelCopy(learnerGroup);
  }

  @action
  setSortBy(what) {
    if(this.sortBy === what){
      what += ':desc';
    }
    if (this.args.setSortBy) {
      this.args.setSortBy(what);
    }
    this.localSortBy = what;
  }
}
