import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { dropTask, restartableTask } from 'ember-concurrency-decorators';
import { timeout } from 'ember-concurrency';
import { cleanQuery } from 'ilios-common/utils/query-utils';
import { tracked } from '@glimmer/tracking';

const DEBOUNCE_MS = 250;
const MIN_INPUT = 3;

export default class LeadershipSearchComponent extends Component {
  @service store;
  @service intl;
  @tracked searchValue = null;

  get existingUserIds() {
    return this.args.existingUsers.mapBy('id');
  }
  @restartableTask
  *searchForUsers(query) {
    this.searchValue = query;

    const q = cleanQuery(query);
    if (!q) {
      yield timeout(1);
      return [];
    }

    if (q.length < MIN_INPUT) {
      return [{
        type: 'text',
        text: this.intl.t('general.moreInputRequiredPrompt')
      }];
    }
    yield timeout(DEBOUNCE_MS);

    const searchResults = yield this.store.query('user', {
      q,
      'order_by[lastName]': 'ASC',
      'order_by[firstName]': 'ASC',
      limit: 100
    });
    if (searchResults.length === 0) {
      return [{
        type: 'text',
        text: this.intl.t('general.noSearchResultsPrompt')
      }];
    }
    const mappedResults = searchResults.map(user => {
      return {
        type: 'user',
        user
      };
    });
    const results = [
      {
        type: 'summary',
        text: this.intl.t('general.resultsCount', {count: mappedResults.length})
      }
    ];
    results.pushObjects(mappedResults);

    return results;
  }

  @dropTask
  *clickUser(user) {
    if (this.existingUserIds.includes(user.id)) {
      return;
    }
    this.searchValue = null;
    yield this.searchForUsers.perform(null);
    this.args.selectUser(user);
  }
}
