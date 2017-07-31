import Component from '@ember/component';
import { computed } from '@ember/object';
const { not } = computed;

export default Component.extend({
  editable: not('course.locked'),
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
