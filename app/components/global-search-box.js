import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { isBlank } from '@ember/utils';
import { findBy } from 'ilios-common/utils/array-helpers';
import { cleanQuery } from 'ilios-common/utils/query-utils';
import { restartableTask, timeout } from 'ember-concurrency';

const DEBOUNCE_MS = 250;
const MIN_INPUT = 3;

export default class GlobalSearchBox extends Component {
  @service iliosConfig;
  @service('search') iliosSearch;
  @service intl;

  @tracked autocompleteCache = [];
  @tracked autocompleteSelectedQuery;
  @tracked internalQuery;
  @tracked searchInputElement;

  get hasResults() {
    return !!this.results?.length;
  }

  get results() {
    return this.autocomplete.lastSuccessful?.value;
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
  focusAndSearch() {
    this.searchInputElement.focus();
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
  keyboard({ keyCode, target }) {
    const container = target.parentElement.parentElement;
    const list = container.getElementsByClassName('autocomplete-row');
    const listArray = Array.from(list);
    const isValid = this.isEnterKey(keyCode) || listArray.length > 0;

    if (isValid) {
      this.keyActions(keyCode, listArray, container);
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

  keyActions(keyCode, listArray, container) {
    if (this.isVerticalKey(keyCode)) {
      this.verticalKeyAction(keyCode, listArray, container);
    }

    if (this.isEnterKey(keyCode)) {
      if (cleanQuery(this.computedQuery).length >= MIN_INPUT) {
        this.args.search(this.computedQuery);
        this.clear();
      }
    }

    if (this.isEscapeKey(keyCode)) {
      this.clear();
      this.args.search('');
    }
  }

  isVerticalKey(keyCode) {
    return keyCode === 38 || keyCode === 40;
  }

  isEnterKey(keyCode) {
    return keyCode === 13;
  }

  isEscapeKey(keyCode) {
    return keyCode === 27;
  }

  verticalKeyAction(keyCode, listArray, container) {
    if (this.listHasFocus(listArray)) {
      this.resultListAction(listArray, keyCode);
    } else {
      const selector = keyCode === 40 ? 'first' : 'last';
      const option = container.querySelector(`.autocomplete li:${selector}-child`);
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
      return [];
    }

    if (q.length < MIN_INPUT) {
      return [
        {
          text: this.intl.t('general.moreInputRequiredPrompt'),
        },
      ];
    }

    const cachedResults = this.findCachedAutocomplete(this.internalQuery);
    if (cachedResults.length) {
      return cachedResults.map((text) => {
        return { text };
      });
    }

    await timeout(DEBOUNCE_MS);

    const { autocomplete } = await this.iliosSearch.forCurriculum(this.internalQuery, true);
    this.autocompleteCache = [...this.autocompleteCache, { q: this.internalQuery, autocomplete }];

    return autocomplete.map((text) => {
      return { text };
    });
  });
}
