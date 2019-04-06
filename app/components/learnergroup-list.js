import Component from '@ember/component';

export default Component.extend({
  classNames: ['learnergroup-list'],

  canCreate: false,
  canDelete: false,
  learnerGroups: null,
  query: null,
  copy() {},
  remove() {},

  init() {
    this._super(...arguments);
    this.set('learnerGroupsForCopy', []);
    this.set('learnerGroupsForRemovalConfirmation', []);
  },

  actions: {
    cancelRemove(learnerGroup) {
      this.learnerGroupsForRemovalConfirmation.removeObject(learnerGroup);
    },

    confirmRemove(learnerGroup) {
      const canDelete = this.canDelete;
      if (canDelete) {
        this.learnerGroupsForRemovalConfirmation.pushObject(learnerGroup);
      }
    },

    cancelCopy(learnerGroup) {
      this.learnerGroupsForCopy.removeObject(learnerGroup);
    },

    startCopy(learnerGroup) {
      this.learnerGroupsForCopy.pushObject(learnerGroup);
    },

    async copy(withLearners, learnerGroup) {
      const copy = this.copy;
      await copy(withLearners, learnerGroup);
      this.learnerGroupsForCopy.removeObject(learnerGroup);
    }
  }
});
