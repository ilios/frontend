import Ember from 'ember';
import scrollTo from '../utils/scroll-to';

const { Component } = Ember;

export default Component.extend({
  tagName: 'section',
  classNames: ['course-details'],
  course: null,
  showDetails: null,
  courseObjectiveDetails: null,
  courseTaxonomyDetails: null,
  courseCompetencyDetails: null,
  actions: {
    collapse() {
      this.get('setShowDetails')(false);
      //when the button is clicked to collapse, animate the focus to the top of the page
      scrollTo("body");
    },
  }

});
