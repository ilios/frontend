import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { isNone } from '@ember/utils';
import { restartableTask, timeout } from 'ember-concurrency';
import { service } from '@ember/service';
import { guidFor } from '@ember/object/internals';
const DEBOUNCE_TIMEOUT = 250;

export default class SearchBox extends Component {
  @service intl;
  @tracked value = '';

  get searchBoxId() {
    return `search-box-${guidFor(this)}`;
  }

  get searchBoxInputElement() {
    return document.getElementById(this.searchBoxId).querySelector('input');
  }

  get liveSearch() {
    return isNone(this.args.liveSearch) ? true : this.args.liveSearch;
  }

  get placeholder() {
    return this.args.placeholder ?? this.intl.t('general.search');
  }

  get maxlength() {
    return this.args.maxlength ?? '6000';
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
    this?.searchBoxInputElement?.focus();
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
