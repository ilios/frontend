/* eslint ember/order-in-components: 0 */
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { computed } from '@ember/object';
import { isBlank } from '@ember/utils';
import { task, timeout } from 'ember-concurrency';
import { cleanQuery } from 'ilios/utils/query-utils';

const { mapBy } = computed;

const DEBOUNCE_MS = 250;
const MIN_INPUT = 3;

export default Component.extend({
  store: service(),
  i18n: service(),
  classNames: ['leadership-search'],
  existingUsers: null,
  existingUserIds: mapBy('existingUsers', 'id'),

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
    const existingUserIds = this.get('existingUserIds');
    if (existingUserIds.includes(user.get('id'))) {
      return;
    }
    this.set('searchValue', null);
    yield this.get('searchForUsers').perform(null);
    this.get('selectUser')(user);
  }).drop(),
});
