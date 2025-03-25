import Component from '@glimmer/component';
import Ember from 'ember';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { dropTask, restartableTask, timeout } from 'ember-concurrency';
import { cleanQuery } from 'ilios-common/utils/query-utils';
import { cached, tracked } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';

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
  keyboard(event) {
    event.preventDefault();

    const { keyCode, target } = event;

    const container = target.parentElement.querySelector('.results');
    const list = container.getElementsByClassName('user');
    const listArray = Array.from(list);

    if (this.isEscapeKey(keyCode)) {
      this.clear();
    }

    const isValid = this.isEnterKey(keyCode) || listArray.length > 0;

    if (isValid) {
      this.keyActions(keyCode, listArray, container);
    }
  }

  keyActions(keyCode, listArray, container) {
    if (this.isEnterKey(keyCode)) {
      this.clickUser.perform({ id: this.activeUserId });
    }

    if (this.isVerticalKey(keyCode)) {
      this.verticalKeyAction(keyCode, listArray, container);
    } else {
      if (cleanQuery(this.searchValue).length >= MIN_INPUT && !this.isHorizontalKey(keyCode)) {
        this.searchForUsers.perform();
      }
    }
  }

  isVerticalKey(keyCode) {
    return this.isUpArrow(keyCode) || this.isDownArrow(keyCode);
  }

  isHorizontalKey(keyCode) {
    return keyCode === 37 || keyCode == 39;
  }

  isUpArrow(keyCode) {
    return keyCode === 38;
  }

  isDownArrow(keyCode) {
    return keyCode === 40;
  }

  isEnterKey(keyCode) {
    return keyCode === 13;
  }

  isEscapeKey(keyCode) {
    return keyCode === 27;
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
}
