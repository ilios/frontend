import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { dropTask, restartableTask, timeout } from 'ember-concurrency';
import { cleanQuery } from 'ilios-common/utils/query-utils';
import { tracked } from '@glimmer/tracking';
import { mapBy } from 'ilios-common/utils/array-helpers';

const DEBOUNCE_MS = 250;
const MIN_INPUT = 3;

export default class LeadershipSearchComponent extends Component {
  @service store;
  @service intl;
  @tracked searchValue = null;

  get existingUserIds() {
    return mapBy(this.args.existingUsers, 'id');
  }

  searchForUsers = restartableTask(async (query) => {
    this.searchValue = query;

    const q = cleanQuery(query);
    if (!q) {
      await timeout(1);
      return [];
    }

    if (q.length < MIN_INPUT) {
      return [
        {
          type: 'text',
          text: this.intl.t('general.moreInputRequiredPrompt'),
        },
      ];
    }
    await timeout(DEBOUNCE_MS);

    const searchResults = await this.store.query('user', {
      q,
      'order_by[lastName]': 'ASC',
      'order_by[firstName]': 'ASC',
      limit: 100,
    });
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
    const result = {
      type: 'summary',
      text: this.intl.t('general.resultsCount', {
        count: mappedResults.length,
      }),
    };

    return [result, ...mappedResults];
  });

  clickUser = dropTask(async (user) => {
    if (this.existingUserIds.includes(user.id)) {
      return;
    }
    this.searchValue = null;
    await this.searchForUsers.perform(null);
    this.args.selectUser(user);
  });
}
