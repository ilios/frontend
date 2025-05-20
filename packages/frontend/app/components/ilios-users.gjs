import Component from '@glimmer/component';
import { service } from '@ember/service';
import { cleanQuery } from 'ilios-common/utils/query-utils';
import { restartableTask, timeout } from 'ember-concurrency';
import { TrackedAsyncData } from 'ember-async-data';
import { tracked, cached } from '@glimmer/tracking';
import { ensureSafeComponent } from '@embroider/util';
import { action } from '@ember/object';
import NewDirectoryUser from './new-directory-user';
import NewUser from './new-user';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import pick from 'ilios-common/helpers/pick';
import or from 'ember-truth-helpers/helpers/or';
import { fn } from '@ember/helper';
import FaIcon from 'ilios-common/components/fa-icon';
import notEq from 'ember-truth-helpers/helpers/not-eq';
import load from 'ember-async-data/helpers/load';
import BulkNewUsers from 'frontend/components/bulk-new-users';
import LoadingSpinner from 'ilios-common/components/loading-spinner';
import PagedlistControls from 'ilios-common/components/pagedlist-controls';
import UserList from 'frontend/components/user-list';

const DEBOUNCE_TIMEOUT = 250;

export default class IliosUsersComponent extends Component {
  @service iliosConfig;
  @service store;
  @service dataLoader;
  @tracked query;

  searchTypeConfig = new TrackedAsyncData(this.iliosConfig.itemFromConfig('userSearchType'));

  constructor() {
    super(...arguments);
    this.query = this.args.query;
  }

  @cached
  get userSearchType() {
    return this.searchTypeConfig.isResolved ? this.searchTypeConfig.value : null;
  }

  @cached
  get loadAllSchoolCohortsPromise() {
    return this.dataLoader.loadSchoolsForLearnerGroups();
  }

  get newUserComponent() {
    const component = this.userSearchType === 'ldap' ? NewDirectoryUser : NewUser;
    return ensureSafeComponent(component, this);
  }

  searchForUsers = restartableTask(async (sort = 'lastName', sortDir = 'ASC') => {
    const q = cleanQuery(this.args.query);
    const orderPrimary = `order_by[${sort === 'fullName' ? 'lastName' : sort}]`;
    const orderSecondary = 'order_by[firstName]';
    const query = {
      // overfetch for nextPage functionality
      limit: this.args.limit + 1,
      q,
      offset: this.args.offset,
    };
    query[orderPrimary] = sortDir;
    query[orderSecondary] = sortDir;

    await timeout(DEBOUNCE_TIMEOUT);
    return this.store.query('user', query);
  });

  @action
  setQuery(query) {
    this.args.setQuery(query);
    if (query != this.query) {
      this.query = query;
      this.setOffset(0);
    } else {
      this.searchForUsers.perform();
    }
  }

  @action
  setLimit(limit) {
    this.args.setLimit(limit);
    this.searchForUsers.perform();
  }

  @action
  setOffset(offset) {
    this.args.setOffset(offset);
    this.searchForUsers.perform();
  }
  <template>
    <div class="ilios-users" data-test-ilios-users ...attributes>
      <div class="filters" data-test-filters>
        <div class="filter user-search">
          <input
            autocomplete="name"
            type="search"
            value={{@query}}
            {{on "input" (pick "target.value" this.setQuery)}}
            placeholder={{t "general.searchUsers"}}
            aria-label={{t "general.searchUsers"}}
          />
        </div>
      </div>
      <section class="users">
        <div class="header" data-test-header>
          <span class="title" data-test-title>
            {{t "general.users"}}
          </span>
          <div class="actions">
            {{#if (or @showNewUserForm @showBulkNewUserForm)}}
              <button
                type="button"
                {{on
                  "click"
                  (if
                    @showNewUserForm
                    (fn @setShowNewUserForm false)
                    (fn @setShowBulkNewUserForm false)
                  )
                }}
                data-test-collapse
              >
                <FaIcon @icon="minus" />
              </button>
            {{else}}
              <button
                type="button"
                {{on "click" (fn @setShowNewUserForm true)}}
                data-test-show-new-user-form
              >
                {{t "general.create"}}
              </button>
              {{#if (notEq this.userSearchType "ldap")}}
                <button
                  type="button"
                  {{on "click" (fn @setShowBulkNewUserForm true)}}
                  data-test-show-bulk-new-user-form
                >
                  {{t "general.createBulk"}}
                </button>
              {{/if}}
            {{/if}}
          </div>
        </div>
        <section class="new">
          {{#if (or @showNewUserForm @showBulkNewUserForm)}}
            {{#let (load this.loadAllSchoolCohortsPromise) as |p|}}
              {{#if p.isResolved}}
                {{#if @showNewUserForm}}
                  <this.newUserComponent
                    @close={{fn @setShowNewUserForm false}}
                    @transitionToUser={{@transitionToUser}}
                    @searchTerms={{@searchTerms}}
                    @setSearchTerms={{@setSearchTerms}}
                  />
                {{/if}}
                {{#if @showBulkNewUserForm}}
                  <BulkNewUsers @close={{fn @setShowBulkNewUserForm false}} />
                {{/if}}
              {{else}}
                <LoadingSpinner />
              {{/if}}
            {{/let}}
          {{/if}}
        </section>
        <div data-test-top-paged-list-controls>
          <PagedlistControls
            @total={{this.searchForUsers.lastSuccessful.value.length}}
            @offset={{@offset}}
            @limit={{@limit}}
            @limitless={{true}}
            @setOffset={{this.setOffset}}
            @setLimit={{this.setLimit}}
          />
        </div>
        <div class="list">
          <UserList
            @users={{this.searchForUsers.lastSuccessful.value}}
            @searchForUsers={{this.searchForUsers}}
            @sortBy={{@sortBy}}
            @setSortBy={{@setSortBy}}
          />
        </div>
        <div data-test-bottom-paged-list-controls>
          <PagedlistControls
            @total={{this.searchForUsers.lastSuccessful.value.length}}
            @offset={{@offset}}
            @limit={{@limit}}
            @limitless={{true}}
            @setOffset={{this.setOffset}}
            @setLimit={{this.setLimit}}
          />
        </div>
      </section>
    </div>
  </template>
}
