import Ember from 'ember';

const { Component } = Ember;

export default Component.extend({
  classNames: ['users-pagination-links'],

  arrows: false,

  actions: {
    getPrevPage() {
      this.sendAction('getPrevPage');
    },

    getNextPage() {
      this.sendAction('getNextPage');
    },
  }
});
