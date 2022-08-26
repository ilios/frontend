import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { dropTask, timeout } from 'ember-concurrency';
import { next } from '@ember/runloop';

export default class SessionsGridHeader extends Component {
  @tracked isExpanding = false;

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
    this.isExpanding = true;
    await timeout(100);
    this.args.toggleExpandAll();
    // we need to wait for the browser to hand back
    //control and then swap the icon back
    await next(() => {
      this.isExpanding = false;
    });
  });
}
