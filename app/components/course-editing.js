/* eslint ember/order-in-components: 0 */
import Component from '@ember/component';

export default Component.extend({
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
