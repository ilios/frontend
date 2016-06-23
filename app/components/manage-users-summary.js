import Ember from 'ember';
import { task, timeout } from 'ember-concurrency';
import { cleanQuery } from 'ilios/utils/query-utils';

const { Component, inject, isBlank } = Ember;
const { service } = inject;
const DEBOUNCE_MS = 250;
const MIN_INPUT = 3;
export default Component.extend({
  iliosConfig: service(),
  i18n: service(),
  store: service(),
  tagName: 'section',
  classNames: ['manage-users-summary', 'large-component'],
  searchForUsers: task(function * (query) {
    const i18n = this.get('i18n');
    const store = this.get('store');

    let q = cleanQuery(query);
    if (isBlank(q)) { return []; }
    yield timeout(DEBOUNCE_MS);

    if (q.length < MIN_INPUT) {
      return [{
        type: 'text',
        text: i18n.t('general.moreInputRequiredPrompt')
      }];
    }

    let searchResults = yield store.query('user', {
      q,
      'order_by[lastName]': 'ASC',
      'order_by[firstName]': 'ASC',
      limit: 100
    });
    if (searchResults.length === 0) {
      return [{
        type: 'text',
        text: i18n.t('general.noSearchResultsPrompt')
      }];
    }
    let mappedResults = searchResults.map(user => {
      return {
        type: 'user',
        user
      };
    });
    let results = [
      {
        type: 'summary',
        text: i18n.t('general.resultsCount', {count: mappedResults.length})
      }
    ];
    results.pushObjects(mappedResults);

    return results;
  }).restartable(),
});
