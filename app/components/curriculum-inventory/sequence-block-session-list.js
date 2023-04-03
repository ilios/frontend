import Component from '@glimmer/component';
import { action } from '@ember/object';
import { use } from 'ember-could-get-used-to-this';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';

export default class SequenceBlockSessionListComponent extends Component {
  @use sessions = new ResolveAsyncValue(() => [this.args.sequenceBlock.sessions, []]);
  @use excludedSessions = new ResolveAsyncValue(() => [
    this.args.sequenceBlock.excludedSessions,
    [],
  ]);

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
