import Ember from 'ember';

export default Ember.Component.extend({
  i18n: Ember.inject.service(),
  isMenuVisible: false,
  actions: {
    toggleMenuVisibility: function(){
      this.toggleProperty('isMenuVisible');
    }
  }
});
