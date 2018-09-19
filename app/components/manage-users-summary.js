/* eslint ember/order-in-components: 0 */
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { isBlank } from '@ember/utils';
import { task, timeout } from 'ember-concurrency';
import { cleanQuery } from 'ilios/utils/query-utils';

const DEBOUNCE_MS = 250;
const MIN_INPUT = 3;
export default Component.extend({
  iliosConfig: service(),
  i18n: service(),
  store: service(),
  routing: service('-routing'),
  tagName: 'section',
  classNames: ['manage-users-summary', 'large-component'],
  canCreate: false,
  searchValue: null,
  searchForUsers: task(function * (query) {
    const i18n = this.i18n;
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
    const routing = this.routing;
    this.set('searchValue', null);
    yield this.searchForUsers.perform(null);
    //private routing API requires putting the model we are passing inside of an array
    //info at https://github.com/emberjs/ember.js/issues/12719#issuecomment-204099140
    routing.transitionTo('user', [user]);
  }).drop(),
});
