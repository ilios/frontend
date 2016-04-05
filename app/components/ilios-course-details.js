import Ember from 'ember';
import scrollTo from '../utils/scroll-to';

const { Component, computed } = Ember;
const { not } = computed;

export default Component.extend({
  course: null,
  collapsed: true,
  notCollapsed: not('collapsed'),
  courseObjectiveDetails: null,
  courseTaxonomyDetails: null,
  courseCompetencyDetails: null,
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
