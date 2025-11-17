import Component from '@glimmer/component';
import { service } from '@ember/service';
import { task, timeout } from 'ember-concurrency';
import { cleanQuery } from 'ilios-common/utils/query-utils';
import { tracked } from '@glimmer/tracking';
import { guidFor } from '@ember/object/internals';
import { mapBy } from 'ilios-common/utils/array-helpers';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import perform from 'ember-concurrency/helpers/perform';
import or from 'ember-truth-helpers/helpers/or';
import eq from 'ember-truth-helpers/helpers/eq';
import includes from 'ilios-common/helpers/includes';
import UserStatus from 'ilios-common/components/user-status';

const DEBOUNCE_MS = 250;
const MIN_INPUT = 3;

export default class LeadershipSearchComponent extends Component {
  @service store;
  @service intl;
  @tracked searchValue = null;

  get searchInputId() {
    return `leadership-search-input-${guidFor(this)}`;
  }

  get searchInputElement() {
    return document.getElementById(this.searchInputId);
  }

  get existingUserIds() {
    return mapBy(this.args.existingUsers, 'id');
  }

  searchForUsers = task({ restartable: true }, async (query) => {
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

  clickUser = task({ drop: true }, async (user) => {
    if (this.existingUserIds.includes(user.id)) {
      return;
    }
    this.searchValue = null;
    await this.searchForUsers.perform(null);
    this.args.selectUser(user);
    this.searchInputElement.focus();
  });
  <template>
    <div class="leadership-search" data-test-leadership-search>
      <input
        autocomplete="name"
        type="search"
        value={{this.searchValue}}
        placeholder={{t "general.searchForIliosUsers"}}
        incremental="true"
        id={{this.searchInputId}}
        {{on "input" (perform this.searchForUsers value="target.value")}}
        {{on "search" (perform this.searchForUsers value="target.value")}}
        {{on "keyup" (perform this.searchForUsers value="target.value")}}
        data-test-search-input
      />
      <ul
        class="results user-search-results
          {{unless
            (or this.searchForUsers.isRunning this.searchForUsers.lastSuccessful.value.length)
            'hidden'
          }}"
      >
        {{#if this.searchForUsers.isRunning}}
          <li>
            {{t "general.currentlySearchingPrompt"}}
          </li>
        {{else}}
          {{#each this.searchForUsers.lastSuccessful.value as |result index|}}
            {{#if (eq result.type "text")}}
              <li>
                {{result.text}}
              </li>
            {{/if}}
            {{#if (eq result.type "summary")}}
              <li class="summary">
                {{result.text}}
              </li>
            {{/if}}
            {{#if (eq result.type "user")}}
              <li
                class="user
                  {{unless (includes result.user.id this.existingUserIds) 'clickable' 'inactive'}}"
                data-test-result-index={{index}}
                data-test-result
              >
                {{#if (includes result.user.id this.existingUserIds)}}
                  <span class="name" data-test-name>
                    <span data-test-fullname>{{result.user.fullName}}</span>
                    <UserStatus @user={{result.user}} />
                  </span>
                  <span class="email" data-test-email>
                    {{result.user.email}}
                  </span>
                {{else}}
                  <button
                    class="select-user"
                    type="button"
                    {{on "click" (perform this.clickUser result.user)}}
                    data-test-select-user
                  >
                    <span class="name" data-test-name>
                      <span data-test-fullname>{{result.user.fullName}}</span>
                      <UserStatus @user={{result.user}} />
                    </span>
                    <span class="email" data-test-email>
                      {{result.user.email}}
                    </span>
                  </button>
                {{/if}}
              </li>
            {{/if}}
          {{/each}}
        {{/if}}
      </ul>
    </div>
  </template>
}
