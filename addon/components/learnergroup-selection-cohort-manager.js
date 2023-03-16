import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { use } from 'ember-could-get-used-to-this';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';

export default class LearnergroupSelectionCohortManagerComponent extends Component {
  @service intl;

  @use learnerGroups = new ResolveAsyncValue(() => [this.args.cohort.learnerGroups]);

  get learnerGroupsLoaded() {
    return !!this.learnerGroups;
  }

  get rootLevelLearnerGroups() {
    if (!this.learnerGroups) {
      return [];
    }
    return this.learnerGroups
      .slice()
      .filter((learnerGroup) => learnerGroup.belongsTo('parent').value() === null);
  }

  @action
  sortByTitle(learnerGroupA, learnerGroupB) {
    const locale = this.intl.get('locale');
    return learnerGroupA.title.localeCompare(learnerGroupB.title, locale, {
      numeric: true,
    });
  }
}
