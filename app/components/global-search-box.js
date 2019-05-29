import Component from '@ember/component';
import { reads } from '@ember/object/computed';
import { isBlank } from '@ember/utils';
import { cleanQuery } from 'ilios-common/utils/query-utils';
import { task, timeout } from 'ember-concurrency';

const DEBOUNCE_MS = 250;
const MIN_INPUT = 3;

export default Component.extend({
  initialQuery: null,
  query: null,
  savedQuery: null,
  showResults: true,
  search() {},

  isLoading: reads('autocomplete.isRunning'),
  hasResults: reads('results.length'),
  results: reads('autocomplete.lastSuccessful.value'),

  init() {
    this._super(...arguments);

    if (this.initialQuery) {
      this.set('query', this.initialQuery);
    }
  },

  didRender() {
    this._super(...arguments);
    this.send('focus');
  },

  actions: {
    focus() {
      document.querySelector('input.global-search-input').focus();
    },

    search() {
      const q = cleanQuery(this.query);

      if (q.length > 0) {
        this.search(q);
      }
    }
  },

  keyUp({ keyCode, target }) {
    const container = target.parentElement.parentElement;
    const fromInput = target.classList.contains('global-search-input');
    const list = container.getElementsByClassName('autocomplete-row');
    const listArray = Array.from(list);

    if (fromInput && listArray.length > 0) {
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

  autocomplete: task(function* () {
    this.set('showResults', true);
    const q = cleanQuery(this.query);

    if (isBlank(q) || q.length < MIN_INPUT) {
      return [];
    }

    yield timeout(DEBOUNCE_MS);
    return [{ text: 'first' }, { text: 'second' }, { text: 'third' }];
  }).restartable()
});
