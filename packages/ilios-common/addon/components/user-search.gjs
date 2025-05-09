import { service } from '@ember/service';
import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { restartableTask } from 'ember-concurrency';
import { TrackedAsyncData } from 'ember-async-data';
import SearchBox from 'ilios-common/components/search-box';
import perform from 'ember-concurrency/helpers/perform';
import t from 'ember-intl/helpers/t';
import and from 'ember-truth-helpers/helpers/and';
import gt from 'ember-truth-helpers/helpers/gt';
import eq from 'ember-truth-helpers/helpers/eq';
import UserSearchResultUser from 'ilios-common/components/user-search-result-user';
import UserSearchResultInstructorGroup from 'ilios-common/components/user-search-result-instructor-group';

export default class UserSearch extends Component {
  @service store;
  @service intl;
  @tracked showMoreInputPrompt = false;
  @tracked searchReturned = false;
  @tracked userResults = [];
  @tracked instructorGroupResults = [];

  @cached
  get currentlyActiveInstructorGroupsData() {
    return new TrackedAsyncData(this.args.currentlyActiveInstructorGroups ?? []);
  }

  get currentlyActiveInstructorGroups() {
    if (!this.currentlyActiveInstructorGroupsData.isResolved) {
      return [];
    }

    return this.currentlyActiveInstructorGroupsData.value;
  }

  @cached
  get currentlyActiveUsersData() {
    return new TrackedAsyncData(this.args.currentlyActiveUsers ?? []);
  }

  get currentlyActiveUsers() {
    if (!this.currentlyActiveUsersData.isResolved) {
      return [];
    }

    return this.currentlyActiveUsersData.value;
  }

  get availableInstructorGroups() {
    return this.args.availableInstructorGroups || [];
  }

  get sortedResults() {
    const results = [...this.userResults, ...this.instructorGroupResults];
    const locale = this.intl.get('locale');
    results.sort((a, b) => {
      return a.sortTerm.localeCompare(b.sortTerm, locale, { numeric: true });
    });
    return results;
  }

  get roles() {
    return this.args.roles || '';
  }

  @action
  addUser(user) {
    if (this.args.addUser) {
      this.args.addUser(user);
    }
  }

  @action
  addInstructorGroup(group) {
    if (this.args.addInstructorGroup) {
      this.args.addInstructorGroup(group);
    }
  }

  search = restartableTask(async (searchTerms = '') => {
    this.showMoreInputPrompt = false;
    this.searchReturned = false;
    this.userResults = [];
    this.instructorGroupResults = [];
    const noWhiteSpaceTerm = searchTerms.replace(/ /g, '');
    if (noWhiteSpaceTerm.length === 0) {
      return;
    } else if (noWhiteSpaceTerm.length < 3) {
      this.showMoreInputPrompt = true;
      return;
    }
    this.userResults = await this.searchUsers(searchTerms);
    this.instructorGroupResults = this.searchInstructorGroups(searchTerms);
    this.searchReturned = true;
  });

  searchInstructorGroups(searchTerms) {
    const fragment = searchTerms.toLowerCase().trim();
    const filteredGroups = this.availableInstructorGroups.filter((group) => {
      return group.title?.toLowerCase().includes(fragment);
    });

    return filteredGroups.map((group) => {
      return { group, type: 'group', sortTerm: group.title };
    });
  }

  async searchUsers(searchTerms) {
    const query = {
      q: searchTerms,
      limit: 100,
    };
    if (this.roles) {
      query.filters = {
        roles: this.roles.split(','),
      };
    }
    const users = await this.store.query('user', query);
    return users.map((user) => {
      return { user, type: 'user', sortTerm: user.fullName };
    });
  }
  <template>
    <div class="user-search" data-test-user-search>
      <SearchBox
        placeholder={{@placeholder}}
        @search={{perform this.search}}
        @clear={{perform this.search}}
      />
      {{#if this.search.isRunning}}
        <ul class="results" data-test-results>
          <li>
            {{t "general.currentlySearchingPrompt"}}
          </li>
        </ul>
      {{/if}}
      {{#if (and this.search.isIdle this.showMoreInputPrompt)}}
        <ul class="results" data-test-results>
          <li>
            {{t "general.moreInputRequiredPrompt"}}
          </li>
        </ul>
      {{/if}}
      {{#if (and this.search.isIdle (gt this.sortedResults.length 0))}}
        <ul class="results" data-test-results>
          <li class="results-count" data-test-results-count>
            {{this.sortedResults.length}}
            {{t "general.results"}}
          </li>
          {{#each this.sortedResults as |result|}}
            {{#if (eq result.type "user")}}
              <UserSearchResultUser
                @user={{result.user}}
                @addUser={{this.addUser}}
                @currentlyActiveUsers={{this.currentlyActiveUsers}}
              />
            {{else}}
              <UserSearchResultInstructorGroup
                @group={{result.group}}
                @addInstructorGroup={{this.addInstructorGroup}}
                @currentlyActiveInstructorGroups={{this.currentlyActiveInstructorGroups}}
              />
            {{/if}}
          {{/each}}
        </ul>
      {{else if this.searchReturned}}
        <ul class="results" data-test-results>
          <li>
            {{t "general.noSearchResultsPrompt"}}
          </li>
        </ul>
      {{/if}}
    </div>
  </template>
}
