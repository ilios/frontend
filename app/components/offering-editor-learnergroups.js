/* eslint ember/order-in-components: 0 */
import Component from '@ember/component';
import { computed } from '@ember/object';
import { isPresent, isEmpty } from '@ember/utils';
import RSVP from 'rsvp';

const { map } = RSVP;

export default Component.extend({
  classNames: ['offering-editor-learnergroups'],

  revisedLearnerGroups: computed('cohort.filteredAvailableLearnerGroups.[]', async function() {
    const cohortId = this.get('cohort.id');
    let learnerGroups = this.get('learnerGroups')[cohortId];

    if (isPresent(learnerGroups)) {
      return await map(learnerGroups, async group => {
        let groupObject = {};
        let parentTitle = await group.get('allParentTitles');
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
    const groups = await this.get('revisedLearnerGroups');
    return groups.sortBy('sortName');
  }),

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
