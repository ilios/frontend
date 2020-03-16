import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  tagName: "",

  hasInstitution: computed('school.curriculumInventoryInstitution', function() {
    return !!this.school.belongsTo('curriculumInventoryInstitution').id();
  }),

  actions: {
    manage() {
      this.manage(true);
    }
  }
});
