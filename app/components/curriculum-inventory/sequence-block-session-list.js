import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class SequenceBlockSessionListComponent extends Component {
  get sortedAscending() {
    const sortBy = this.args.sortBy;
    return sortBy.search(/desc/) === -1;
  }

  @action
  changeSortOrder(what) {
    const sortBy = this.args.sortBy;
    if (sortBy === what) {
      what += ':desc';
    }
    this.args.setSortBy(what);
  }
}
