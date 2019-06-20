import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { isBlank } from '@ember/utils';
import { task, timeout } from 'ember-concurrency';
import { cleanQuery } from 'ilios-common/utils/query-utils';

const DEBOUNCE_MS = 250;
const MIN_INPUT = 3;

export default Component.extend({
  iliosConfig: service(),
  intl: service(),
  routing: service('-routing'),
  store: service(),

  classNames: ['manage-users-summary', 'large-component'],
  tagName: 'section',

  canCreate: false,
  searchValue: null,

  searchForUsers: task(function* (query) {
    const intl = this.intl;
    const store = this.store;

    let q = cleanQuery(query);
    if (isBlank(q)) {
      yield timeout(1);
      return [];
    }
    yield timeout(DEBOUNCE_MS);

    if (q.length < MIN_INPUT) {
      return [{
        type: 'text',
        text: intl.t('general.moreInputRequiredPrompt')
      }];
    }
    let params = { q, limit: 100 };

    const searchEnabled = yield this.iliosConfig.searchEnabled;
    if (!searchEnabled) {
      params['order_by[lastName]'] = 'ASC';
      params['order_by[firstName]'] = 'ASC';
    }

    let searchResults = yield store.query('user', params);
    if (searchResults.length === 0) {
      return [{
        type: 'text',
        text: intl.t('general.noSearchResultsPrompt')
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
        text: intl.t('general.resultsCount', {count: mappedResults.length})
      }
    ];
    results.pushObjects(mappedResults);
    return results;
  }).restartable(),

  clickUser: task(function* (user) {
    const routing = this.routing;
    this.set('searchValue', null);
    yield this.searchForUsers.perform(null);
    //private routing API requires putting the model we are passing inside of an array
    //info at https://github.com/emberjs/ember.js/issues/12719#issuecomment-204099140
    routing.transitionTo('user', [user]);
  }).drop()
});
