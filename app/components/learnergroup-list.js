import Ember from 'ember';

const { Component } = Ember;

export default Component.extend({
  learnerGroups: [],
  learnerGroupsForRemovalConfirmation: [],
  actions: {
    cancelRemove: function(learnerGroup){
      this.get('learnerGroupsForRemovalConfirmation').removeObject(learnerGroup);
    },
    confirmRemove: function(learnerGroup){
      this.get('learnerGroupsForRemovalConfirmation').pushObject(learnerGroup);
    },
  }
});
