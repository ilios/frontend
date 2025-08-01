import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { cleanQuery } from 'ilios-common/utils/query-utils';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import pick from 'ilios-common/helpers/pick';
import perform from 'ember-concurrency/helpers/perform';
import { restartableTask } from 'ember-concurrency';
import onKey from 'ember-keyboard/modifiers/on-key';
import FaIcon from 'ilios-common/components/fa-icon';

const MIN_INPUT = 3;

export default class GlobalSearchBox extends Component {
  @service router;

  @tracked internalQuery;

  get computedQuery() {
    if (typeof this.internalQuery === 'string') {
      return this.internalQuery;
    }
    return this.args.query;
  }

  @action
  focusAndSearch(event) {
    const searchInputElement =
      event.currentTarget.parentElement.getElementsByClassName('global-search-input')[0];
    searchInputElement.focus();
    this.search();
  }

  @action
  search() {
    if (cleanQuery(this.computedQuery).length >= MIN_INPUT) {
      this.args.search(this.computedQuery);
      this.clear();
    }
  }

  @action
  onEscapeKey() {
    this.clear();
    if (this.router.currentRouteName === 'search') {
      this.args.search('');
    }
  }

  @action
  onEnterKey() {
    if (cleanQuery(this.computedQuery).length >= MIN_INPUT) {
      this.args.search(this.computedQuery);
      this.clear();
    }
  }

  setInternalQuery = restartableTask(async (q) => {
    this.internalQuery = q;
    if (this.router.currentRouteName === 'search') {
      if (q === '') {
        this.args.search('');
      }
    }
  });

  /**
   * Clear all the caches and query local copies
   * This component is complicated by the many types of user interaction
   * it accepts and it's need to go back into a default state so there are
   * several things to clear
   */
  clear() {
    this.internalQuery = null;
  }

  <template>
    <div class="global-search-box" data-test-global-search-box>
      <input
        aria-label={{t "general.searchTheCurriculum"}}
        class="global-search-input"
        data-test-input
        type="search"
        value={{this.computedQuery}}
        {{on "input" (pick "target.value" (perform this.setInternalQuery))}}
        {{onKey "Escape" this.onEscapeKey}}
        {{onKey "Enter" this.onEnterKey}}
        {{onKey "ArrowUp" this.onArrowKey}}
        {{onKey "ArrowDown" this.onArrowKey}}
      />
      <button
        aria-label={{t "general.search"}}
        type="button"
        data-test-search-icon
        {{on "click" this.focusAndSearch}}
      >
        <FaIcon @icon="magnifying-glass" />
      </button>
    </div>
  </template>
}
