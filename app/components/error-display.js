import Ember from 'ember';

const { Component, computed, isPresent } = Ember;

export default Component.extend({
  classNames: ['error-display'],
  errors: null,
  now: null,
  showDetails: true,

  didReceiveAttrs(){
    this._super(...arguments);
    this.set('now', new Date());
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
    }
  }
});
