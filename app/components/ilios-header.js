/* eslint ember/no-observers: 0, ember/no-on-calls-in-components: 0 */
import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { once } from '@ember/runloop';
import { computed, observer } from '@ember/object';
import { on } from '@ember/object/evented';

export default Component.extend({
  currentUser: service(),
  session: service(),
  pageTitleList: service(),
  router: service(),
  iliosConfig: service(),

  classNames: ['ilios-header'],
  tagName: 'header',
  ariaRole: 'banner',
  title: null,

  'data-test-ilios-header': true,

  showSearch: computed(
    'currentUser.performsNonLearnerFunction',
    'session.isAuthenticated',
    'router.currentRouteName',
    'iliosConfig.searchEnabled',
    async function () {
      const searchEnabled = await this.iliosConfig.searchEnabled;
      return searchEnabled &&
        this.session.isAuthenticated &&
        this.router.currentRouteName !== 'search' &&
        this.currentUser.performsNonLearnerFunction;
    }
  ),

  /**
   * We have to use an observer here
   * otherwise we get errors when the property is double set
   */
  titleChangeObserver: on('init', observer('pageTitleList.sortedTokens.[]', function () {
    const pageTitleList = this.pageTitleList;
    const setTitle = function () {
      const tokens = pageTitleList.get('sortedTokens');
      if (tokens.length) {
        this.set('title', tokens[0].title);
      }
    };
    once(this, setTitle);
  })),

  actions: {
    search(q) {
      this.router.transitionTo('search', {
        queryParams: { q }
      });
    }
  }
});
