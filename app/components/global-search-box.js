import Component from '@ember/component';
import { task, timeout } from 'ember-concurrency';
import { cleanQuery } from 'ilios-common/utils/query-utils';
import { isBlank } from '@ember/utils';
import { inject as service } from '@ember/service';

const DEBOUNCE_MS = 250;
const MIN_INPUT = 3;
export default Component.extend({
  intl: service(),
  store: service(),
  tagName: '',
  searchValue: null,

  actions: {
    focus({ target }) {
      //place focus into the search box when search icon is clicked
      target.parentElement.parentElement.querySelector('input[type="search"]').focus();
    },
  },
  search: task(function* () {

  }),
  autocomplete: task(function* () {
    let q = cleanQuery(this.searchValue);
    if (isBlank(q)) {
      return [];
    }
    yield timeout(DEBOUNCE_MS);

    if (q.length < MIN_INPUT) {
      return [{
        type: 'text',
        text: this.intl.t('general.moreInputRequiredPrompt')
      }];
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
  }),
});
