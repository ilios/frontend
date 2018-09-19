import Component from '@ember/component';
import scrollTo from '../utils/scroll-to';

export default Component.extend({
  tagName: 'section',
  classNames: ['course-details'],
  course: null,
  editable: false,
  showDetails: null,
  courseObjectiveDetails: null,
  courseTaxonomyDetails: null,
  courseCompetencyDetails: null,
  'data-test-ilios-course-details': true,
  actions: {
    collapse() {
      this.setShowDetails(false);
      //when the button is clicked to collapse, animate the focus to the top of the page
      scrollTo("body");
    },
  }

});
