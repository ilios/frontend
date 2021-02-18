import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { isNone } from '@ember/utils';
import { restartableTask, timeout } from 'ember-concurrency';

const DEBOUNCE_TIMEOUT = 250;

export default class SearchBox extends Component {
  @tracked value = '';
  @tracked searchInput;

  get liveSearch() {
    return isNone(this.args.liveSearch) ? true : this.args.liveSearch;
  }

  @action
  update(event) {
    this.value = event.target.value;
    if (this.liveSearch) {
      this.searchTask.perform();
    }
  }

  @action
  clear() {
    this.value = '';
    if (this.args.clear) {
      this.args.clear();
    }
  }

  @action
  moveFocus() {
    // place focus into the search box when search icon is clicked
    this?.searchInput.focus();
  }

  @action
  keyUp({ key }) {
    switch (key) {
      case 'Enter':
        this.searchTask.perform();
        break;
      case 'Escape':
        this.clear();
        break;
    }
  }

  @restartableTask
  *searchTask() {
    yield timeout(DEBOUNCE_TIMEOUT);
    yield this.args.search(this.value);
  }
}
