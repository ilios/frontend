import Ember from 'ember';

const { Component, computed } = Ember;

export default Component.extend({
  instructorGroups: [],
  proxiedInstructorGroups: computed('instructorGroups.[]', function(){
    return this.get('instructorGroups').map(function(instructorGroup){
      return Ember.ObjectProxy.create({
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
