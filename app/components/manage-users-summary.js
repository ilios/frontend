import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { isBlank } from '@ember/utils';
import { task, timeout } from 'ember-concurrency';
import { cleanQuery } from 'ilios-common/utils/query-utils';

const DEBOUNCE_MS = 250;
const MIN_INPUT = 3;

export default Component.extend({
  iliosConfig: service(),
  intl: service(),
  session: service('session'),
  store: service(),
  router: service('router'),

  classNames: ['manage-users-summary', 'large-component'],
  tagName: 'section',

  canCreate: false,
  searchValue: null,

  authHeaders: computed('session.isAuthenticated', function(){
    const session = this.session;
    const { jwt } = session.data.authenticated;
    let headers = {};
    if (jwt) {
      headers['X-JWT-Authorization'] = `Token ${jwt}`;
    }

    return new Headers(headers);
  }),

  /**
   * Find users using the user API
   * @param {string} q
   */
  async apiSearch(q) {
    let params = {
      q,
      limit: 100,
      'order_by[lastName]': 'ASC',
      'order_by[firstName]': 'ASC',
    };

    return await this.store.query('user', params);
  },

  /**
   * Find users using the search index API
   * @param {string} q
   */
  async indexSearch(q) {
    const host = this.iliosConfig.apiHost?this.iliosConfig.apiHost:window.location.protocol + '//' + window.location.host;
    const url = `${host}/experimental_search/v1/users?q=${q}&size=100`;
    const response = await fetch(url, {
      headers: this.authHeaders
    });
    const { results: { users } } = await response.json();

    return users.map(user => {
      user.fullName = this.getUserFullName(user);

      return user;
    });
  },

  getUserFullName(user) {
    if (user.displayName) {
      return user.displayName;
    }

    if (!user.firstName || !user.lastName) {
      return '';
    }

    const middleInitial = user.middleName?user.middleName.charAt(0):false;

    if (middleInitial) {
      return `${user.firstName} ${middleInitial}. ${user.lastName}`;
    } else {
      return `${user.firstName} ${user.lastName}`;
    }
  },

  searchForUsers: task(function * (query) {
    const intl = this.intl;

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
    const searchEnabled = yield this.iliosConfig.searchEnabled;

    let searchResults;
    if (searchEnabled) {
      searchResults = yield this.indexSearch(q);
    } else {
      searchResults = yield this.apiSearch(q);
    }

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

  clickUser: task(function* ({ id }) {
    yield this.router.transitionTo('user', id);
    this.set('searchValue', null);
    yield this.searchForUsers.perform(null);
  }).drop(),
});
