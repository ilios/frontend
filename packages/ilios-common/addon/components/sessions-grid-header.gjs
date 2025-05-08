import Component from '@glimmer/component';
import { action } from '@ember/object';
import { dropTask, timeout } from 'ember-concurrency';

export default class SessionsGridHeader extends Component {
  get sortedAscending() {
    return this.args.sortBy.search(/desc/) === -1;
  }

  @action
  setSortBy(what) {
    if (this.args.sortBy === what) {
      what += ':desc';
    }
    this.args.setSortBy(what);
  }

  expandAll = dropTask(async () => {
    await timeout(100);
    this.args.toggleExpandAll();
  });
}
