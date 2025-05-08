import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';

export default class LearnergroupSelectionCohortManagerComponent extends Component {
  @service intl;

  @cached
  get learnerGroups() {
    return new TrackedAsyncData(this.args.cohort.learnerGroups);
  }

  get rootLevelLearnerGroups() {
    if (!this.learnerGroups.isResolved) {
      return [];
    }
    return this.learnerGroups.value.filter(
      (learnerGroup) => learnerGroup.belongsTo('parent').value() === null,
    );
  }

  @action
  sortByTitle(learnerGroupA, learnerGroupB) {
    const locale = this.intl.get('locale');
    return learnerGroupA.title.localeCompare(learnerGroupB.title, locale, {
      numeric: true,
    });
  }
}
