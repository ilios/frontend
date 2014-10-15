import Ember from 'ember';

export default Ember.ObjectController.extend({
  showModal: false,
  actions: {
    toggleVisibility: function(){
      this.toggleProperty('showModal');
    }
  }
});
