/* eslint ember/order-in-components: 0 */
import Component from '@ember/component';
import { computed } from '@ember/object';
import ObjectProxy from '@ember/object/proxy';

export default Component.extend({
  instructorGroups: null,
  canDelete: false,

  proxiedInstructorGroups: computed('instructorGroups.[]', function(){
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
    edit(instructorGroupProxy) {
      this.sendAction('edit', instructorGroupProxy.get('content'));
    },
    remove(instructorGroupProxy) {
      this.sendAction('remove', instructorGroupProxy.get('content'));
    },
    cancelRemove(instructorGroupProxy) {
      instructorGroupProxy.set('showRemoveConfirmation', false);
    },
    confirmRemove(instructorGroupProxy) {
      instructorGroupProxy.set('showRemoveConfirmation', true);
    },
  }
});
