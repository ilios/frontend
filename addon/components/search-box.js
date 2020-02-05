import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { isNone } from '@ember/utils';
import { timeout } from 'ember-concurrency';
import {restartableTask} from "ember-concurrency-decorators";

const DEBOUNCE_TIMEOUT = 250;

export default class SearchBox extends Component {
  @tracked value = '';

  get liveSearch() {
    return isNone(this.args.liveSearch) ? true : this.args.liveSearch;
  }

  @action
  update(value){
    this.value = value;
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
  moveFocus(searchInput) {
    // place focus into the search box when search icon is clicked
    searchInput.focus();
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
