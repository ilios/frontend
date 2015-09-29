import Ember from 'ember';

const { Component, computed, isEmpty, isPresent } = Ember;
const { sort, filter } = computed;

export default Component.extend({
  classNames: ['offering-editor-learnergroups'],

  revisedLearnerGroups: computed('learnerGroups', {
    get() {
      let learnerGroups = this.get('learnerGroups');
      let revisedGroups = [];

      if (isPresent(learnerGroups)) {
        learnerGroups.forEach((group) => {
          let groupObject = {};
          let parentTitle = group.get('allParentTitles');
          groupObject.group = group;

          if (isEmpty(parentTitle)) {
            groupObject.sortName = group.get('title');
          } else {
            groupObject.sortName = `${parentTitle[0]} > ${group.get('title')}`;
          }

          revisedGroups.push(groupObject);
        });
      }

      return revisedGroups;
    }
  }).readOnly(),

  sortBy: ['sortName'],

  sortedLearnerGroups: sort('revisedLearnerGroups', 'sortBy'),

  actions: {
    addLearnerGroup(group) {
      this.sendAction('addLearnerGroup', group);
    },

    removeLearnerGroup(group) {
      this.sendAction('removeLearnerGroup', group);
    }
  }
});
