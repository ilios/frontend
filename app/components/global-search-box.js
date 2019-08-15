import Component from '@ember/component';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { isBlank } from '@ember/utils';
import { cleanQuery } from 'ilios-common/utils/query-utils';
import { task, timeout } from 'ember-concurrency';

const DEBOUNCE_MS = 250;
const MIN_INPUT = 3;

export default Component.extend({
  iliosConfig: service(),
  iliosSearch: service('search'),

  autocompleteCache: null,
  autocompleteSelectedQuery: null,
  internalQuery: null,
  query: null,
  classNames: ['global-search-box'],
  'data-test-global-search-box': true,
  search() { },

  hasResults: reads('results.length'),
  results: reads('autocomplete.lastSuccessful.value'),

  computedQuery: computed('autocompleteSelectedQuery', 'query', 'internalQuery', function () {
    if (typeof (this.autocompleteSelectedQuery) === 'string') {
      return this.autocompleteSelectedQuery;
    }
    if (typeof (this.internalQuery) === 'string') {
      return this.internalQuery;
    }
    return this.query;
  }),

  init() {
    this._super(...arguments);
    this.autocompleteCache = [];
  },

  actions: {
    focus({ target }) {
      const container = target.parentElement.parentElement.parentElement;
      container.querySelector('input.global-search-input').focus();
    },

    search() {
      if (cleanQuery(this.computedQuery).length > 0) {
        this.search(this.computedQuery);
        this.clear();
      }
    },
  },

  /**
   * Clear all the caches and query local copies
   * This component is complicated by the many types of user interaction
   * it accepts and it's need to go back into a default state so there are
   * several things to clear
   */
  clear() {
    this.autocompleteCache = [];
    this.set('internalQuery', null);
    this.set('autocompleteSelectedQuery', null);
    this.autocomplete.perform();
  },

  keyUp({ keyCode, target }) {
    const container = target.parentElement.parentElement;
    const fromInput = target.classList.contains('global-search-input');
    const list = container.getElementsByClassName('autocomplete-row');
    const listArray = Array.from(list);
    const isValid = this.isEnterKey(keyCode) || listArray.length > 0;

    if (fromInput && isValid) {
      this.keyActions(keyCode, listArray, container);
    }
  },

  keyActions(keyCode, listArray, container) {
    if (this.isVerticalKey(keyCode)) {
      this.verticalKeyAction(keyCode, listArray, container);
    }

    if (this.isEnterKey(keyCode)) {
      this.search(this.computedQuery);
      this.clear();
    }

    if (this.isEscapeKey(keyCode)) {
      this.clear();
      this.search('');
    }
  },

  isVerticalKey(keyCode) {
    return keyCode === 38 || keyCode === 40;
  },

  isEnterKey(keyCode) {
    return keyCode === 13;
  },

  isEscapeKey(keyCode) {
    return keyCode === 27;
  },

  verticalKeyAction(keyCode, listArray, container) {
    if (this.listHasFocus(listArray)) {
      this.resultListAction(listArray, keyCode);
    } else {
      const selector = keyCode === 40 ? 'first' : 'last';
      const option = container.querySelector(`.autocomplete li:${selector}-child`);
      option.classList.add('active');
      this.set('autocompleteSelectedQuery', option.innerText.trim());
    }
  },

  resultListAction(listArray, keyCode) {
    if (this.hasFocusOnEdge(listArray, keyCode === 40)) {
      this.removeActiveClass(listArray);
      this.set('autocompleteSelectedQuery', null);
    } else {
      this.addClassToNext(listArray, keyCode === 38);
    }
  },

  listHasFocus(listArray) {
    return listArray.any((element) => element.classList.contains('active'));
  },

  hasFocusOnEdge(listArray, shouldReverse) {
    const list = shouldReverse ? listArray.slice().reverse() : listArray;
    return list[0].classList.contains('active');
  },

  removeActiveClass(listArray) {
    listArray.forEach(({ classList }) => classList.remove('active'));
  },

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
        this.set('autocompleteSelectedQuery', element.innerText.trim());
      }
    });
  },

  /**
   * Discover previously cached autocomplete suggestions
   * @param {string} q
   *
   * @returns {array}
   */
  findCachedAutocomplete(q) {
    const exactMatch = this.autocompleteCache.findBy('q', q);
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
      const possibleMatches = this.autocompleteCache.findBy('q', newQuery);

      if (possibleMatches) {
        const matches = possibleMatches.autocomplete.filter(text => {
          return text.substring(newQuery.length, newQuery.length + 1) === removedChar;
        });

        set.pushObjects(matches);
      }

      return set;
    }, []);

    return allMatches.filter(text => text.indexOf(q) === 0);
  },

  autocomplete: task(function* () {
    const q = cleanQuery(this.internalQuery);

    if (isBlank(q) || q.length < MIN_INPUT) {
      return [];
    }

    const cachedResults = this.findCachedAutocomplete(this.internalQuery);
    if (cachedResults.length) {
      return cachedResults.map(text => {
        return { text };
      });
    }

    yield timeout(DEBOUNCE_MS);

    const { autocomplete } = yield this.iliosSearch.forCurriculum(this.internalQuery, true);
    this.autocompleteCache.pushObject({ q: this.internalQuery, autocomplete });

    return autocomplete.map(text => {
      return { text };
    });
  }).restartable()
});
