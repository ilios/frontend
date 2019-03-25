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
  search: task(function* () {

    let q = cleanQuery(this.searchValue);
    if (isBlank(q)) {
      yield timeout(1);
      return [];
    }
    yield timeout(DEBOUNCE_MS);

    if (q.length < MIN_INPUT) {
      return [{
        type: 'text',
        text: this.intl.t('general.moreInputRequiredPrompt')
      }];
    }

    let searchResults = yield this.store.query('search', { q });
    if (searchResults.length === 0) {
      return [{
        type: 'text',
        text: this.intl.t('general.noSearchResultsPrompt')
      }];
    }

    let results = [
      {
        type: 'summary',
        text: this.intl.t('general.resultsCount', {count: 11})
      }
    ];

    return results;
  }),
});
