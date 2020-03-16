import Component from '@ember/component';
import { computed } from '@ember/object';
import { isEmpty, isPresent } from '@ember/utils';
import { map } from 'rsvp';

export default Component.extend({
  tagName: "",

  revisedLearnerGroups: computed('cohort.filteredAvailableLearnerGroups.[]', async function() {
    const cohortId = this.get('cohort.id');
    const learnerGroups = this.learnerGroups[cohortId];

    if (isPresent(learnerGroups)) {
      return await map(learnerGroups, async group => {
        const groupObject = {};
        const parentTitle = await group.get('allParentTitles');
        groupObject.group = group;

        if (isEmpty(parentTitle)) {
          groupObject.sortName = group.get('title');
        } else {
          groupObject.sortName = `${parentTitle[0]} > ${group.get('title')}`;
        }

        return groupObject;
      });
    }

    return [];
  }),


  sortedLearnerGroups: computed('revisedLearnerGroups.[]', async function() {
    const groups = await this.revisedLearnerGroups;
    return groups.sortBy('sortName');
  }),

  actions: {
    addLearnerGroup(group) {
      const cohortId = this.get('cohort.id');
      this.addLearnerGroup(group, cohortId);
    },

    removeLearnerGroup(group) {
      const cohortId = this.get('cohort.id');
      this.removeLearnerGroup(group, cohortId);
    }
  }
});
