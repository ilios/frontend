import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class LearnerGroupListComponent extends Component {
  @service intl;
  @tracked sortBy = 'title';

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
  sortByTitle(instructorGroupA, instructorGroupB) {
    const locale = this.intl.get('primaryLocale');
    if ('title:desc' === this.args.sortBy) {
      return instructorGroupB.title.localeCompare(instructorGroupA.title, locale, {
        numeric: true,
      });
    }
    return instructorGroupA.title.localeCompare(instructorGroupB.title, locale, { numeric: true });
  }
}
