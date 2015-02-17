import Ember from 'ember';

export default Ember.Component.extend({
  collapsed: true,
  actions: {
    expand: function(){
      this.sendAction('collapsedState', false);
    },
    collapse: function(){
      this.sendAction('collapsedState', true);
    },
  }

});
