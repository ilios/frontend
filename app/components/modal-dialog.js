import Ember from 'ember';

export default Ember.Component.extend({
  showModal: false,
  actions: {
    toggleVisibility: function(){
      this.toggleProperty('showModal');
    }
  }
});
