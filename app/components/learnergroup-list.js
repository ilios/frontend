import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  tagName: "",
  bubbleSort: true,
  canCreate: false,
  canDelete: false,
  learnerGroups: null,
  query: null,
  sortBy: 'title',
  copy() {},
  remove() {},
  setSortBy() {},

  sortedAscending: computed('sortBy', function() {
    return this.sortBy.search(/desc/) === -1;
  }),

  sortedLearnerGroups: computed('learnerGroups.[]', 'sortBy', 'sortedAscending', function () {
    if (!this.learnerGroups) {
      return [];
    }
    let sortBy = this.sortBy;
    if (sortBy.indexOf(':') !== -1) {
      sortBy = sortBy.split(':', 1)[0];
    }

    let sortedLearnerGroups = this.learnerGroups.sortBy(sortBy);

    if (!this.sortedAscending) {
      sortedLearnerGroups = sortedLearnerGroups.slice().reverse();
    }

    return sortedLearnerGroups;
  }),

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
    },

    sortBy(what) {
      const sortBy = this.sortBy;

      if (sortBy === what){
        what += ':desc';
      }

      if (this.bubbleSort) {
        this.setSortBy(what);
      } else {
        this.set('sortBy', what);
      }
    }
  }
});
