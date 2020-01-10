import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { timeout } from 'ember-concurrency';
import { next } from '@ember/runloop';
import { dropTask } from "ember-concurrency-decorators";

export default class SessionsGridHeader extends Component {
  @tracked isExpanding = false;

  get sortedAscending () {
    return this.args.sortBy.search(/desc/) === -1;
  }

  @action
  setSortBy(what) {
    if (this.args.sortBy === what) {
      what += ':desc';
    }
    this.args.setSortBy(what);
  }

  @dropTask
  *expandAll() {
    this.isExpanding = true;
    yield timeout(100);
    this.args.toggleExpandAll();
    // we need to wait for the browser to hand back
    //control and then swap the icon back
    yield next(() => {
      this.isExpanding = false;
    });
  }
}
