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

  get sortGroups() {
    const locale = this.intl.get('primaryLocale');
    if (this.args.sortBy === 'title') {
      return (instructorGroupA, instructorGroupB) => {
        return instructorGroupA.title.localeCompare(instructorGroupB.title, locale, {
          numeric: true,
        });
      };
    }
    if (this.args.sortBy === 'title:desc') {
      return (instructorGroupA, instructorGroupB) => {
        return instructorGroupB.title.localeCompare(instructorGroupA.title, locale, {
          numeric: true,
        });
      };
    }
    if (this.args.sortBy === 'courses') {
      return (a, b) => {
        return a.courses.length - b.courses.length;
      };
    }
    if (this.args.sortBy === 'courses:desc') {
      return (a, b) => {
        return b.courses.length - a.courses.length;
      };
    }

    return this.args.sortBy;
  }
}
