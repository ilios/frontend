import Component from '@ember/component';
import { computed } from '@ember/object';
import { isPresent } from '@ember/utils';

export default Component.extend({
  tagName: "",

  errors: null,
  isOffline: false,
  now: null,
  showDetails: true,

  is404: computed('errors.[]', function() {
    const errors = this.errors;
    if (isPresent(errors)) {
      const firstError = errors.get('firstObject');
      if (isPresent(firstError)) {
        return firstError.statusCode === '404';
      }
    }

    return false;
  }),

  didReceiveAttrs() {
    this._super(...arguments);
    this.set('now', new Date());
    if (!navigator.onLine) {
      this.set('isOffline', true);
    }
  },

  actions: {
    toggleDetails() {
      this.set('showDetails', !this.showDetails);
    },

    refresh() {
      window.location.reload();
    }
  }
});
