import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  'data-test-learnergroup-bulk-group-matcher': true,
  tagName: 'tr',
  matches: null,
  groups: null,
  groupName: null,
  classNames: ['learnergroup-bulk-group-matcher'],
  classNameBindings: ['matchedGroupId:matched:not-matched'],
  matchedGroupId: computed('matches.[]', 'groupName', function () {
    const matches = this.get('matches');
    const groupName = this.get('groupName');
    const match = matches.findBy('name', groupName);
    if (match) {
      return match.get('group.id');
    }

    return null;
  }),
  noGroupWithThisName: computed('groups.[]', 'groupName', function () {
    const groups = this.get('groups');
    const groupName = this.get('groupName');
    const match = groups.findBy('title', groupName);
    return match ? false : true;
  }),
  actions: {
    matchGroup(learnerGroupId) {
      const groupName = this.get('groupName');
      const unsetMatch = this.get('unsetMatch');
      const setMatch = this.get('setMatch');
      if (learnerGroupId === 'null') {
        unsetMatch(groupName);
      } else {
        setMatch(groupName, learnerGroupId);
      }

    }
  }
});
