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
    edit: function(instructorGroupProxy){
      this.sendAction('edit', instructorGroupProxy.get('content'));
    },
    remove: function(instructorGroupProxy){
      this.sendAction('remove', instructorGroupProxy.get('content'));
    },
    cancelRemove: function(instructorGroupProxy){
      instructorGroupProxy.set('showRemoveConfirmation', false);
    },
    confirmRemove: function(instructorGroupProxy){
      instructorGroupProxy.set('showRemoveConfirmation', true);
    },
  }
});
