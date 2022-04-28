import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class LearnerGroupsListComponent extends Component {
  @service intl;

  get sortedAscending() {
    return !this.args.sortBy.includes(':desc');
  }

  @action
  setSortBy(what) {
    if (this.args.sortBy === what) {
      what += ':desc';
    }
    this.args.setSortBy(what);
  }

  @action
  sortByTitle(learnerGroupA, learnerGroupB) {
    const locale = this.intl.get('primaryLocale');
    if ('title:desc' === this.args.sortBy) {
      return learnerGroupB.title.localeCompare(learnerGroupA.title, locale, { numeric: true });
    }
    return learnerGroupA.title.localeCompare(learnerGroupB.title, locale, { numeric: true });
  }
}
