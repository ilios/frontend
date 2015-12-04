import Ember from 'ember';

const { Component } = Ember;

export default Component.extend({
  i18n: Ember.inject.service(),
  isMenuVisible: false,
  actions: {
    toggleMenuVisibility: function(){
      this.toggleProperty('isMenuVisible');
    }
  }
});
