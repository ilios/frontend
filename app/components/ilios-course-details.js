import Ember from 'ember';
import scrollTo from '../utils/scroll-to';

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
      //when the button is clicked to collapse, animate the focus to the top of the page
      scrollTo("body");
    },
  }

});
