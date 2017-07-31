import Component from '@ember/component';
import { computed } from '@ember/object';
import { isPresent, isEmpty } from '@ember/utils';
const { sort } = computed;

export default Component.extend({
  classNames: ['offering-editor-learnergroups'],

  revisedLearnerGroups: computed('cohort.filteredAvailableLearnerGroups.[]', {
    get() {
      const cohortId = this.get('cohort.id');
      let learnerGroups = this.get('learnerGroups')[cohortId];
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
      const cohortId = this.get('cohort.id');
      this.sendAction('addLearnerGroup', group, cohortId);
    },

    removeLearnerGroup(group) {
      const cohortId = this.get('cohort.id');
      this.sendAction('removeLearnerGroup', group, cohortId);
    }
  }
});
