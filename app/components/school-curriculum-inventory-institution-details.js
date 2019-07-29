import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  "data-test-school-curriculum-inventory-institution-details": true,
  classNames: ['school-curriculum-inventory-institution-details'],

  hasInstitution: computed('school.curriculumInventoryInstitution', function() {
    return !!this.school.belongsTo('curriculumInventoryInstitution').id();
  }),

  actions: {
    manage() {
      this.manage(true);
    }
  }
});
