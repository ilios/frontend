import Component from '@glimmer/component';
import Ember from 'ember';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { dropTask, restartableTask, timeout } from 'ember-concurrency';
import { cleanQuery } from 'ilios-common/utils/query-utils';
import { cached, tracked } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import t from 'ember-intl/helpers/t';
import { LinkTo } from '@ember/routing';
import { hash } from '@ember/helper';
import notEq from 'ember-truth-helpers/helpers/not-eq';
import { on } from '@ember/modifier';
import queue from 'ilios-common/helpers/queue';
import pick from 'ilios-common/helpers/pick';
import set from 'ember-set-helper/helpers/set';
import perform from 'ember-concurrency/helpers/perform';
import onKey from 'ember-keyboard/modifiers/on-key';
import eq from 'ember-truth-helpers/helpers/eq';
import FaIcon from 'ilios-common/components/fa-icon';

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
  @tracked activeUserId;

  userSearchTypeData = new TrackedAsyncData(this.iliosConfig.getUserSearchType());

  @cached
  get userSearchType() {
    return this.userSearchTypeData.isResolved ? this.userSearchTypeData.value : null;
  }

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

  clear() {
    this.searchValue = null;
  }

  @action
  onEscapeKey() {
    this.clear();
    this.searchForUsers.perform();
  }

  @action
  onEnterKey() {
    if (this.activeUserId) {
      this.clickUser.perform({ id: this.activeUserId });
    } else {
      this.searchForUsers.perform();
    }
  }

  @action
  onArrowKey(event) {
    const { keyCode, target } = event;

    const container = target.parentElement.querySelector('.results');
    const list = container.getElementsByClassName('user');
    const listArray = Array.from(list);

    const isValid = listArray.length > 0;

    if (isValid) {
      this.verticalKeyAction(keyCode, listArray, container);
    }
  }

  get shouldHideResults() {
    return (
      this.searchForUsers.isIdle &&
      (this.searchForUsers.performCount == 0 ||
        this.searchForUsers.lastSuccessful.value.length == 0 ||
        !this.searchValue)
    );
  }

  isUpArrow(keyCode) {
    return keyCode === 38;
  }

  isDownArrow(keyCode) {
    return keyCode === 40;
  }

  verticalKeyAction(keyCode, listArray, container) {
    if (this.listHasFocus(listArray)) {
      this.resultListAction(listArray, keyCode);
    } else {
      const index = this.isDownArrow(keyCode) ? 0 : listArray.length - 1;
      const option = container.querySelectorAll('.user')[index];
      option.classList.add('active');
      this.scrollToActiveElement(option);
    }

    this.activeUserId = this.getActiveUserId(listArray);
  }

  resultListAction(listArray, keyCode) {
    if (this.hasFocusOnEdge(listArray, this.isDownArrow(keyCode))) {
      this.removeActiveClass(listArray);
      if (this.isDownArrow(keyCode)) {
        listArray[0].classList.add('active');
        this.scrollToActiveElement(listArray[0]);
      } else {
        listArray.slice().reverse()[0].classList.add('active');
        this.scrollToActiveElement(listArray.slice().reverse()[0]);
      }
    } else {
      this.addClassToNext(listArray, this.isUpArrow(keyCode));
    }
  }

  listHasFocus(listArray) {
    return Boolean(listArray.find((element) => element.classList.contains('active')));
  }

  hasFocusOnEdge(listArray, shouldReverse) {
    const list = shouldReverse ? listArray.slice().reverse() : listArray;
    return list[0].classList.contains('active');
  }

  removeActiveClass(listArray) {
    listArray.forEach(({ classList }) => classList.remove('active'));
  }

  addClassToNext(listArray, shouldReverse) {
    const list = shouldReverse ? listArray.slice().reverse() : listArray;
    let shouldAddClass = false;
    list.forEach((element) => {
      const { classList } = element;

      if (classList.contains('active')) {
        shouldAddClass = true;
        classList.remove('active');
      } else if (shouldAddClass) {
        classList.add('active');
        shouldAddClass = false;
        this.scrollToActiveElement(element);
      }
    });
  }

  scrollToActiveElement(element) {
    element.scrollIntoView({ block: 'nearest', behavior: 'instant' });
  }

  getActiveUserId(listArray) {
    const activeElement = listArray.find((element) => element.classList.contains('active'));

    return activeElement ? activeElement.querySelector('button').dataset.userid : null;
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
        showLinkToAll: mappedResults.length >= SEARCH_RESULTS_MAX,
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
    this.clear();
    await this.searchForUsers.perform();
  });
  <template>
    <section
      class="manage-users-summary large-component"
      data-test-manage-users-summary
      ...attributes
    >
      <div class="header">
        <h2 class="title">
          {{t "general.manageUsersSummaryTitle"}}
          (<LinkTo
            @route="users"
            @query={{hash showBulkNewUserForm=false showNewUserForm=false filter=null}}
            data-test-users-link
          >
            {{t "general.viewAll"}}
          </LinkTo>)
        </h2>
        <div class="actions">
          {{#if @canCreate}}
            <LinkTo
              @route="users"
              @query={{hash showNewUserForm=true showBulkNewUserForm=false filter=null}}
              data-test-create-user-link
            >
              <button type="button">
                {{t "general.create"}}
              </button>
            </LinkTo>
            {{#if (notEq this.userSearchType "ldap")}}
              <LinkTo @route="users" @query={{hash showBulkNewUserForm=true showNewUserForm=false}}>
                <button type="button">
                  {{t "general.createBulk"}}
                </button>
              </LinkTo>
            {{/if}}
          {{/if}}
        </div>
      </div>
      <div class="user-search">
        <input
          autocomplete="name"
          type="search"
          value={{this.searchValue}}
          {{on
            "input"
            (queue (pick "target.value" (set this "searchValue")) (perform this.searchForUsers))
          }}
          placeholder={{t "general.searchForIliosUsers"}}
          aria-label={{t "general.searchForIliosUsers"}}
          incremental="true"
          {{onKey "Escape" this.onEscapeKey}}
          {{onKey "Enter" this.onEnterKey}}
          {{onKey "ArrowUp" this.onArrowKey}}
          {{onKey "ArrowDown" this.onArrowKey}}
        />
        <ul class="results{{if this.shouldHideResults ' hidden'}}">
          {{#if this.searchForUsers.isRunning}}
            <li>
              {{t "general.currentlySearchingPrompt"}}
            </li>
          {{else}}
            {{#each this.searchForUsers.lastSuccessful.value as |result|}}
              {{#if (eq result.type "text")}}
                <li>
                  {{result.text}}
                </li>
              {{/if}}
              {{#if (eq result.type "summary")}}
                <li class="summary">
                  {{result.text}}
                  {{#if result.showLinkToAll}}
                    <LinkTo
                      @route="users"
                      @query={{hash filter=this.searchValue}}
                      data-test-view-all-results
                    >
                      {{t "general.viewAll"}}
                    </LinkTo>
                  {{/if}}
                </li>
              {{/if}}
              {{#if (eq result.type "user")}}
                <li class="user clickable">
                  <button
                    class="link-button"
                    type="button"
                    disabled={{this.clickUser.isRunning}}
                    data-userid={{result.user.id}}
                    {{on "click" (perform this.clickUser result.user)}}
                  >
                    <span class="name">
                      {{result.user.fullName}}
                      {{#unless result.user.enabled}}
                        <FaIcon
                          @icon="user-xmark"
                          @title={{t "general.disabled"}}
                          class="disabled-user"
                        />
                      {{/unless}}
                    </span>
                    <span class="email">
                      {{result.user.email}}
                    </span>
                  </button>
                </li>
              {{/if}}
            {{/each}}
          {{/if}}
        </ul>
      </div>
    </section>
  </template>
}
