import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  tagName: '',
  matches: null,
  groups: null,
  groupName: null,

  matchedGroupId: computed('matches.[]', 'groupName', function () {
    const matches = this.matches;
    const groupName = this.groupName;
    const match = matches.findBy('name', groupName);
    if (match) {
      return match.group.id;
    }

    return null;
  }),

  noGroupWithThisName: computed('groups.[]', 'groupName', function () {
    const groups = this.groups;
    const groupName = this.groupName;
    const match = groups.findBy('title', groupName);
    return match ? false : true;
  }),

  actions: {
    matchGroup(learnerGroupId) {
      const groupName = this.groupName;
      const unsetMatch = this.unsetMatch;
      const setMatch = this.setMatch;
      if (learnerGroupId === 'null') {
        unsetMatch(groupName);
      } else {
        setMatch(groupName, learnerGroupId);
      }
    },
  },
});
