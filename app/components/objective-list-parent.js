import Ember from 'ember';

export default Ember.Component.extend({
  actions: {
    manageParents: function(objective){
      this.sendAction('manageParents', objective);
    }
  }
});
