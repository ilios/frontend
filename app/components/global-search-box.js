import Component from '@ember/component';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { isBlank } from '@ember/utils';
import { cleanQuery } from 'ilios-common/utils/query-utils';
import { task, timeout } from 'ember-concurrency';
import fetch from 'fetch';

const DEBOUNCE_MS = 250;
const MIN_INPUT = 3;

export default Component.extend({
  iliosConfig: service(),
  session: service(),

  autocompleteCache: null,
  initialQuery: null,
  query: null,
  savedQuery: null,
  showResults: true,
  search() {},

  isLoading: reads('autocomplete.isRunning'),
  hasResults: reads('results.length'),
  results: reads('autocomplete.lastSuccessful.value'),

  authHeaders: computed('session.isAuthenticated', function(){
    const session = this.session;
    const { jwt } = session.data.authenticated;
    let headers = {};
    if (jwt) {
      headers['X-JWT-Authorization'] = `Token ${jwt}`;
    }

    return new Headers(headers);
  }),

  init() {
    this._super(...arguments);
    this.autocompleteCache = [];

    if (this.initialQuery) {
      this.set('query', this.initialQuery);
    }
  },

  actions: {
    focus({ target }) {
      const container = target.parentElement.parentElement.parentElement;
      container.querySelector('input.global-search-input').focus();
    },

    search() {
      const q = cleanQuery(this.query);

      if (q.length > 0) {
        this.autocompleteCache = [];
        this.search(q);
        this.set('showResults', false);
      }
    },

    addActiveClass({ target }) {
      const container = target.parentElement;
      const list = container.getElementsByClassName('autocomplete-row');
      const listArray = Array.from(list);
      this.removeActiveClass(listArray);
      target.classList.add('active');
    }
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
      this.send('search');
      this.set('showResults', false);
    }

    if (this.isEscapeKey(keyCode)) {
      this.setProperties({ query: '', showResults: false });
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
      this.set('savedQuery', this.query);
      option.classList.add('active');
      option.onfocus();
    }
  },

  resultListAction(listArray, keyCode) {
    if (this.hasFocusOnEdge(listArray, keyCode === 40)) {
      this.removeActiveClass(listArray);
      this.set('query', this.savedQuery);
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
        element.onfocus();
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
    this.set('showResults', true);
    const q = cleanQuery(this.query);

    if (isBlank(q) || q.length < MIN_INPUT) {
      return [];
    }

    const cachedResults = this.findCachedAutocomplete(q);
    if (cachedResults.length) {
      return cachedResults.map(text => {
        return { text };
      });
    }

    yield timeout(DEBOUNCE_MS);

    const host = this.iliosConfig.apiHost?this.iliosConfig.apiHost:window.location.protocol + '//' + window.location.host;
    const url = `${host}/experimental_search/v1/curriculum?q=${q}&onlySuggest=true`;
    const response = yield fetch(url, {
      headers: this.authHeaders
    });
    const { results: { autocomplete } } = yield response.json();
    this.autocompleteCache.pushObject({ q, autocomplete });

    return autocomplete.map(text => {
      return { text };
    });
  }).restartable()
});
