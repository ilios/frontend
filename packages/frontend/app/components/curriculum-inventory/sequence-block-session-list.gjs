import Component from '@glimmer/component';
import { action } from '@ember/object';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';

export default class SequenceBlockSessionListComponent extends Component {
  @cached
  get sessionsData() {
    return new TrackedAsyncData(this.args.sequenceBlock.sessions);
  }

  get sessions() {
    return this.sessionsData.isResolved ? this.sessionsData.value : [];
  }

  @cached
  get excludedSessionsData() {
    return new TrackedAsyncData(this.args.sequenceBlock.excludedSessions);
  }

  get excludedSessions() {
    return this.excludedSessionsData.isResolved ? this.excludedSessionsData.value : [];
  }

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
