import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { isNone } from '@ember/utils';
import { restartableTask, timeout } from 'ember-concurrency';
import { inject as service } from '@ember/service';
const DEBOUNCE_TIMEOUT = 250;

export default class SearchBox extends Component {
  @service intl;
  @tracked value = '';
  @tracked searchInput;

  get liveSearch() {
    return isNone(this.args.liveSearch) ? true : this.args.liveSearch;
  }

  get placeholder() {
    return this.args.placeholder ?? this.intl.t('general.search');
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

  searchTask = restartableTask(async () => {
    this.moveFocus();
    await timeout(DEBOUNCE_TIMEOUT);
    await this.args.search(this.value);
  });
}
