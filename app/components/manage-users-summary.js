import Ember from 'ember';
import { task, timeout } from 'ember-concurrency';
import { cleanQuery } from 'ilios/utils/query-utils';

const { Component, isBlank } = Ember;
const DEBOUNCE_MS = 250;
const MIN_INPUT = 3;
export default Component.extend({
  iliosConfig: Ember.inject.service(),
  i18n: Ember.inject.service(),
  store: Ember.inject.service(),
  routing: Ember.inject.service('-routing'),
  tagName: 'section',
  classNames: ['manage-users-summary', 'large-component'],
  searchValue: null,
  searchForUsers: task(function * (query) {
    const i18n = this.get('i18n');
    const store = this.get('store');

    let q = cleanQuery(query);
    if (isBlank(q)) {
      yield timeout(1);
      return [];
    }
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

  clickUser: task(function * (user) {
    const routing = this.get('routing');
    this.set('searchValue', null);
    yield this.get('searchForUsers').perform(null);
    //private routing API requires putting the model we are passing inside of an array
    //info at https://github.com/emberjs/ember.js/issues/12719#issuecomment-204099140
    routing.transitionTo('user', [user]);
  }).drop(),
});
