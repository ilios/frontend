import Ember from 'ember';

export default Ember.Component.extend({
  instructorGroups: [],
  proxiedInstructorGroups: function(){
    return this.get('instructorGroups').map(function(instructorGroup){
      return Ember.ObjectProxy.create({
        content: instructorGroup,
        showRemoveConfirmation: false
      });
    });
  }.property('instructorGroups.@each'),
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
