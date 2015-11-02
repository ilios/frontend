import Ember from 'ember';

const { Component, computed, isPresent } = Ember;

export default Component.extend({
  classNames: ['error-display'],

  content: null,

  showDetails: false,

  totalErrors: computed('content.[]', {
    get() {
      const contentLength = this.get('content').length;

      return contentLength > 1 ? `There are ${contentLength} errors` : 'There is 1 error';
    }
  }).readOnly(),

  actions: {
    toggleDetails() {
      this.set('showDetails', !this.get('showDetails'));
    }
  }
});
