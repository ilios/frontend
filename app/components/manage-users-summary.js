import Component from '@glimmer/component';
import Ember from 'ember';
import { inject as service } from '@ember/service';
import { dropTask, restartableTask, timeout } from 'ember-concurrency';
import { cleanQuery } from 'ilios-common/utils/query-utils';
import { tracked } from '@glimmer/tracking';
import { use } from 'ember-could-get-used-to-this';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';

const DEBOUNCE_MS = 250;
const MIN_INPUT = 3;
const SEARCH_RESULTS_MAX = 100;

export default class ManageUsersSummaryComponent extends Component {
  @service iliosConfig;
  @service intl;
  @service router;
  @service search;
  @service store;

  @tracked searchValue;

  @use userSearchType = new ResolveAsyncValue(() => [this.iliosConfig.getUserSearchType()]);

  /**
   * Find users using the user API
   * @param {string} q
   */
  async apiSearch(q) {
    const params = {
      q,
      limit: SEARCH_RESULTS_MAX,
      'order_by[lastName]': 'ASC',
      'order_by[firstName]': 'ASC',
    };

    return this.store.query('user', params);
  }

  /**
   * Find users using the search index API
   * @param {string} q
   */
  async indexSearch(q) {
    const { users } = await this.search.forUsers(q);

    return users;
  }

  @restartableTask
  *searchForUsers() {
    const q = cleanQuery(this.searchValue);
    if (!q) {
      yield timeout(1);
      return [];
    }
    yield timeout(DEBOUNCE_MS);

    if (q.length < MIN_INPUT) {
      return [
        {
          type: 'text',
          text: this.intl.t('general.moreInputRequiredPrompt'),
        },
      ];
    }
    const searchEnabled = yield this.iliosConfig.getSearchEnabled();
    const searchResults = searchEnabled ? yield this.indexSearch(q) : yield this.apiSearch(q);

    if (searchResults.length === 0) {
      return [
        {
          type: 'text',
          text: this.intl.t('general.noSearchResultsPrompt'),
        },
      ];
    }
    const mappedResults = searchResults.map((user) => {
      return {
        type: 'user',
        user,
      };
    });
    return [
      {
        type: 'summary',
        text: this.intl.t('general.resultsCount', { count: mappedResults.length }),
        showLinkToAll: mappedResults.length >= SEARCH_RESULTS_MAX,
      },
      ...mappedResults,
    ];
  }

  @dropTask
  *clickUser({ id }) {
    yield this.router.transitionTo('user', id, {
      queryParams: {
        isManagingBio: Ember.DEFAULT_VALUE,
        isManagingRoles: Ember.DEFAULT_VALUE,
        isManagingCohorts: Ember.DEFAULT_VALUE,
        isManagingIcs: Ember.DEFAULT_VALUE,
        isManagingSchools: Ember.DEFAULT_VALUE,
      },
    });
    this.searchValue = null;
    yield this.searchForUsers.perform();
  }
}
