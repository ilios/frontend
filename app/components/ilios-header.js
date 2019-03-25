/* eslint ember/no-observers: 0, ember/no-on-calls-in-components: 0 */
import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { once } from '@ember/runloop';
import { observer } from '@ember/object';
import { on } from '@ember/object/evented';

export default Component.extend({
  session: service(),
  pageTitleList: service(),
  features: service(),

  classNames: ['ilios-header'],
  tagName: 'header',
  ariaRole: 'banner',
  title: null,

  /**
   * We have to use an observer here
   * otherwise we get errors when the property is double set
   */
  titleChangeObserver: on('init', observer('pageTitleList.sortedTokens.[]', function () {
    const pageTitleList = this.get('pageTitleList');
    once(this, function () {
      const tokens = pageTitleList.get('sortedTokens');
      if (tokens.length) {
        this.set('title', tokens[0].title);
      }
    });
  })),
});
