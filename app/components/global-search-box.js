import Component from '@ember/component';
import { task, timeout } from 'ember-concurrency';
import { cleanQuery } from 'ilios-common/utils/query-utils';

const DEBOUNCE_MS = 250;
const MIN_INPUT = 3;
export default Component.extend({
  tagName: '',
  query: null,
  search(){},

  actions: {
    search() {
      let q = cleanQuery(this.query);
      if (q.length > 0) {
        this.search(q);
      }
    },
    focus({ target }) {
      //place focus into the search box when search icon is clicked
      target.parentElement.parentElement.querySelector('input[type="search"]').focus();
    },
  },
  autocomplete: task(function* () {
    let q = cleanQuery(this.query);
    if (q.length === 0) {
      return [];
    }
    yield timeout(DEBOUNCE_MS);

    if (q.length < MIN_INPUT) {
      return [];
    }

    return [
      {
        type: 'text',
        text: 'first'
      },
      {
        type: 'text',
        text: 'second'
      },
      {
        type: 'text',
        text: 'third'
      },
    ];
  }).restartable(),
});
