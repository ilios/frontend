import Ember from 'ember';

export default Ember.Component.extend({
  learnerGroups: [],
  proxiedLearnerGroups: function(){
    return this.get('learnerGroups').map(function(learnerGroup){
      return Ember.ObjectProxy.create({
        content: learnerGroup,
        showRemoveConfirmation: false
      });
    });
  }.property('learnerGroups.@each'),
  actions: {
    edit: function(learnerGroupProxy){
      this.sendAction('edit', learnerGroupProxy.get('content'));
    },
    remove: function(learnerGroupProxy){
      this.sendAction('remove', learnerGroupProxy.get('content'));
    },
    cancelRemove: function(learnerGroupProxy){
      learnerGroupProxy.set('showRemoveConfirmation', false);
    },
    confirmRemove: function(learnerGroupProxy){
      learnerGroupProxy.set('showRemoveConfirmation', true);
    },
  }
});
