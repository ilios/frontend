import Ember from 'ember';

const { Component } = Ember;

export default Component.extend({
  learnerGroups: [],
  learnerGroupsForRemovalConfirmation: [],
  actions: {
    cancelRemove(learnerGroup) {
      this.get('learnerGroupsForRemovalConfirmation').removeObject(learnerGroup);
    },
    confirmRemove(learnerGroup) {
      this.get('learnerGroupsForRemovalConfirmation').pushObject(learnerGroup);
    },
  }
});
