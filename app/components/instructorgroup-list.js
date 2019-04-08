import Component from '@ember/component';
import ObjectProxy from '@ember/object/proxy';
import { computed } from '@ember/object';

export default Component.extend({
  canDelete: false,
  instructorGroups: null,
  query: null,
  remove() {},

  proxiedInstructorGroups: computed('instructorGroups.[]', function() {
    const instructorGroups = this.instructorGroups;
    if (!instructorGroups) {
      return [];
    }
    return instructorGroups.map(instructorGroup => {
      return ObjectProxy.create({
        content: instructorGroup,
        showRemoveConfirmation: false
      });
    });
  }),

  actions: {
    remove(instructorGroupProxy) {
      this.remove(instructorGroupProxy.get('content'));
    },

    cancelRemove(instructorGroupProxy) {
      instructorGroupProxy.set('showRemoveConfirmation', false);
    },

    confirmRemove(instructorGroupProxy) {
      instructorGroupProxy.set('showRemoveConfirmation', true);
    }
  }
});
