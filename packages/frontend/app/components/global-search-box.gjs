import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { isBlank } from '@ember/utils';
import { findBy } from 'ilios-common/utils/array-helpers';
import { cleanQuery } from 'ilios-common/utils/query-utils';
import { restartableTask, timeout } from 'ember-concurrency';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import queue from 'ilios-common/helpers/queue';
import pick from 'ilios-common/helpers/pick';
import set from 'ember-set-helper/helpers/set';
import perform from 'ember-concurrency/helpers/perform';
import onKey from 'ember-keyboard/modifiers/on-key';
import FaIcon from 'ilios-common/components/fa-icon';
import onClickOutside from 'ember-click-outside/modifiers/on-click-outside';
import { fn } from '@ember/helper';

const DEBOUNCE_MS = 250;
const MIN_INPUT = 3;

export default class GlobalSearchBox extends Component {
  @service iliosConfig;
  @service('search') iliosSearch;
  @service intl;
  @service router;

  @tracked autocompleteCache = [];
  @tracked autocompleteSelectedQuery;
  @tracked internalQuery;
  @tracked results = null;

  get hasResults() {
    return !!this.results?.length;
  }

  get computedQuery() {
    if (typeof this.autocompleteSelectedQuery === 'string') {
      return this.autocompleteSelectedQuery;
    }
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
  searchFromResult(result) {
    this.autocompleteSelectedQuery = null;
    this.internalQuery = result.text;
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

  @action
  onArrowKey(event) {
    const { keyCode, target } = event;

    const container = target.parentElement.parentElement;
    const list = container.getElementsByClassName('autocomplete-row');
    const listArray = Array.from(list);

    const isValid = listArray.length > 0;

    if (isValid) {
      this.verticalKeyAction(keyCode, listArray, container);
    }
  }

  /**
   * Clear all the caches and query local copies
   * This component is complicated by the many types of user interaction
   * it accepts and it's need to go back into a default state so there are
   * several things to clear
   */
  clear() {
    this.autocompleteCache = [];
    this.internalQuery = null;
    this.autocompleteSelectedQuery = null;
    this.autocomplete.perform();
  }

  verticalKeyAction(keyCode, listArray, container) {
    if (this.listHasFocus(listArray)) {
      this.resultListAction(listArray, keyCode);
    } else {
      const selector = keyCode === 40 ? 'first' : 'last';
      const option = container.querySelector(`.autocomplete-row:${selector}-child`);
      option.classList.add('active');
      this.autocompleteSelectedQuery = option.innerText.trim();
    }
  }

  resultListAction(listArray, keyCode) {
    if (this.hasFocusOnEdge(listArray, keyCode === 40)) {
      this.removeActiveClass(listArray);
      this.autocompleteSelectedQuery = null;
    } else {
      this.addClassToNext(listArray, keyCode === 38);
    }
  }

  listHasFocus(listArray) {
    return Boolean(listArray.find((element) => element.classList.contains('active')));
  }

  hasFocusOnEdge(listArray, shouldReverse) {
    const list = shouldReverse ? listArray.slice().reverse() : listArray;
    return list[0].classList.contains('active');
  }

  removeActiveClass(listArray) {
    listArray.forEach(({ classList }) => classList.remove('active'));
  }

  addClassToNext(listArray, shouldReverse) {
    const list = shouldReverse ? listArray.slice().reverse() : listArray;
    let shouldAddClass = false;
    list.forEach((element) => {
      const { classList } = element;

      if (classList.contains('active')) {
        shouldAddClass = true;
        classList.remove('active');
      } else if (shouldAddClass) {
        classList.add('active');
        shouldAddClass = false;
        this.autocompleteSelectedQuery = element.innerText.trim();
      }
    });
  }

  /**
   * Discover previously cached autocomplete suggestions
   * @param {string} q
   *
   * @returns {array}
   */
  findCachedAutocomplete(q) {
    const exactMatch = findBy(this.autocompleteCache, 'q', q);
    if (exactMatch) {
      return exactMatch.autocomplete;
    }
    const possibleKeys = [];
    for (let i = q.length; i > MIN_INPUT; i--) {
      possibleKeys.push(q.substring(0, i));
    }

    const allMatches = possibleKeys.reduce((set, q) => {
      const removedChar = q.substring(q.length - 1);
      const newQuery = q.substring(0, q.length - 1);
      const possibleMatches = findBy(this.autocompleteCache, 'q', newQuery);

      if (possibleMatches) {
        const matches = possibleMatches.autocomplete.filter((text) => {
          return text.substring(newQuery.length, newQuery.length + 1) === removedChar;
        });

        set = [...set, ...matches];
      }

      return set;
    }, []);

    return allMatches.filter((text) => text.indexOf(q) === 0);
  }

  autocomplete = restartableTask(async () => {
    const q = cleanQuery(this.internalQuery);

    if (isBlank(q)) {
      this.results = [];
      return [];
    }

    if (q.length < MIN_INPUT) {
      this.results = [
        {
          text: this.intl.t('general.moreInputRequiredPrompt'),
        },
      ];

      return this.results;
    }

    const cachedResults = this.findCachedAutocomplete(this.internalQuery);
    if (cachedResults.length) {
      this.results = cachedResults.map((text) => {
        return { text };
      });
      return this.results;
    }

    await timeout(DEBOUNCE_MS);

    const { autocomplete } = await this.iliosSearch.forCurriculum(this.internalQuery, true);
    this.autocompleteCache = [...this.autocompleteCache, { q: this.internalQuery, autocomplete }];

    this.results = autocomplete.map((text) => {
      return { text };
    });
    return this.results;
  });
  <template>
    <div class="global-search-box" data-test-global-search-box>
      <input
        aria-label={{t "general.searchTheCurriculum"}}
        autocomplete="name"
        class="global-search-input"
        data-test-input
        type="search"
        value={{this.computedQuery}}
        {{on
          "input"
          (queue
            (pick "target.value" (set this "internalQuery"))
            (set this "autocompleteSelectedQuery" null)
            (perform this.autocomplete)
          )
        }}
        {{onKey "Escape" this.onEscapeKey}}
        {{onKey "Enter" this.onEnterKey}}
        {{onKey "ArrowUp" this.onArrowKey}}
        {{onKey "ArrowDown" this.onArrowKey}}
      />
      <button
        aria-label={{t "general.search"}}
        class="link-button search-icon"
        type="button"
        data-test-search-icon
        {{on "click" this.focusAndSearch}}
      >
        <FaIcon @icon="magnifying-glass" />
      </button>
      {{#if this.hasResults}}
        <div {{onClickOutside (set this "results" null)}}>
          <div class="autocomplete" data-test-autocomplete>
            {{#each this.results as |result|}}
              <button
                type="button"
                class="autocomplete-row"
                data-test-autocomplete-row
                {{on "click" (fn this.searchFromResult result)}}
              >
                <FaIcon @icon="magnifying-glass" />
                {{result.text}}
              </button>
            {{/each}}
          </div>
        </div>
      {{/if}}
    </div>
  </template>
}
