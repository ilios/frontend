/* eslint ember/order-in-components: 0 */
import Component from '@ember/component';
import { computed } from '@ember/object';
import { isPresent } from '@ember/utils';

export default Component.extend({
  classNames: ['error-display'],
  errors: null,
  now: null,
  showDetails: true,
  isOffline: false,

  didReceiveAttrs(){
    this._super(...arguments);
    this.set('now', new Date());
    if (!navigator.onLine) {
      this.set('isOffline', true);
    }
  },

  is404: computed('errors.[]', function(){
    const errors = this.get('errors');
    if (isPresent(errors)) {
      const firstError = errors.get('firstObject');
      if (isPresent(firstError)) {
        return firstError.statusCode === '404';
      }
    }

    return false;
  }),

  actions: {
    toggleDetails() {
      this.set('showDetails', !this.get('showDetails'));
    },
    refresh() {
      window.location.reload();
    }
  }
});
