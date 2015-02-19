import Ember from 'ember';

export default Ember.Component.extend({
  course: null,
  collapsed: true,
  notCollapsed: Ember.computed.not('collapsed'),
  actions: {
    expand: function(){
      this.sendAction('collapsedState', false);
    },
    collapse: function(){
      this.sendAction('collapsedState', true);
    },
  }

});
