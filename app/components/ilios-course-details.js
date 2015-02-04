import Ember from 'ember';

export default Ember.Component.extend({
  collapsed: true,
  actions: {
    expand: function(){
      this.set('collapsed', false);
    },
    collapse: function(){
      this.set('collapsed', true);
    },
  }

});
