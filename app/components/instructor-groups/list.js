import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class LearnerGroupListComponent extends Component {
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

  get sortedGroups() {
    const sortBy = this.args.sortBy;
    const instructorGroups = this.args.instructorGroups.slice();
    if (sortBy.includes('title')) {
      const locale = this.intl.get('primaryLocale');
      return instructorGroups.sort((a, b) =>
        a.title.localeCompare(b.title, locale, {
          numeric: true,
        })
      );
    }
    if (sortBy.includes('courses')) {
      return instructorGroups.sort((a, b) => a.courses.length - b.courses.length);
    }

    return instructorGroups.sort((a, b) => a.usersCount - b.usersCount);
  }

  get orderedGroups() {
    return this.sortedAscending ? this.sortedGroups : this.sortedGroups.reverse();
  }
}
