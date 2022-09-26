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
      limit: 100,
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

  searchForUsers = restartableTask(async () => {
    const q = cleanQuery(this.searchValue);
    if (!q) {
      await timeout(1);
      return [];
    }
    await timeout(DEBOUNCE_MS);

    if (q.length < MIN_INPUT) {
      return [
        {
          type: 'text',
          text: this.intl.t('general.moreInputRequiredPrompt'),
        },
      ];
    }
    const searchEnabled = await this.iliosConfig.getSearchEnabled();
    const searchResults = searchEnabled ? await this.indexSearch(q) : await this.apiSearch(q);

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
      },
      ...mappedResults,
    ];
  });

  clickUser = dropTask(async ({ id }) => {
    await this.router.transitionTo('user', id, {
      queryParams: {
        isManagingBio: Ember.DEFAULT_VALUE,
        isManagingRoles: Ember.DEFAULT_VALUE,
        isManagingCohorts: Ember.DEFAULT_VALUE,
        isManagingIcs: Ember.DEFAULT_VALUE,
        isManagingSchools: Ember.DEFAULT_VALUE,
      },
    });
    this.searchValue = null;
    await this.searchForUsers.perform();
  });
}
