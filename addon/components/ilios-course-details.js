import Component from '@ember/component';
import layout from '../templates/components/ilios-course-details';
import scrollTo from '../utils/scroll-to';

export default Component.extend({
  layout,
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
      this.get('setShowDetails')(false);
      //when the button is clicked to collapse, animate the focus to the top of the page
      scrollTo("body");
    },
  }
});
