/* eslint ember/order-in-components: 0 */
import Component from '@ember/component';

export default Component.extend({
  init(){
    this._super(...arguments);
    this.set('learnerGroupsForRemovalConfirmation', []);
    this.set('learnerGroupsForCopy', []);
  },
  learnerGroups: null,
  canDelete: false,
  canCreate: false,
  learnerGroupsForRemovalConfirmation: null,
  learnerGroupsForCopy: null,
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
