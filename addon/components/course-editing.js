/* eslint ember/order-in-components: 0 */
import Component from '@ember/component';
import layout from '../templates/components/course-editing';

export default Component.extend({
  layout,
  editable: false,
  courseObjectiveDetails: false,
  courseTaxonomyDetails: false,
  courseCompetencyDetails: false,
  actions: {
    save() {
      const course = this.get('course');
      course.save();
    },
  }
});
