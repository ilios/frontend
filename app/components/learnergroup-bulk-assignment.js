import Component from '@ember/component';
import EmberObject, { computed } from '@ember/object';
import { isEmpty, isPresent } from '@ember/utils';
import { inject as service } from '@ember/service';

export default Component.extend({
  store: service(),
  user: null,
  validUsers: null,
  learnerGroup: null,

  matchedGroups: null,
  classNames: ['learnergroup-bulk-assignment'],

  unmatchedGroups: computed('validUsers.@each.subGroupName', function () {
    const validUsers = this.validUsers;
    if (!validUsers) {
      return [];
    }
    return validUsers.mapBy('subGroupName').uniq().filter(str => isPresent(str));
  }),
  allUnmatchedGroupsMatched: computed('unmatchedGroups.[]', 'matchedGroups.[]', function () {
    const unmatchedGroups = this.unmatchedGroups;
    const matchedGroups = this.matchedGroups;
    const groupsStillNotMatched = unmatchedGroups.filter(groupName => {
      const match = matchedGroups.findBy('name', groupName);
      return isEmpty(match);
    });

    return groupsStillNotMatched.length === 0;
  }),
  groups: computed('learnerGroup.allDescendants.[]', async function () {
    const learnerGroup = this.learnerGroup;
    return await learnerGroup.get('allDescendants');
  }),

  init(){
    this._super(...arguments);
    this.set('matchedGroups', []);
  },

  actions: {
    async addMatch(groupName, groupId) {
      const store = this.store;
      const group = await store.find('learner-group', groupId);
      const matchedGroups = this.matchedGroups.toArray();
      const match = matchedGroups.findBy('name', groupName);
      if (match) {
        match.set('group', group);
      } else {
        matchedGroups.pushObject(EmberObject.create({
          name: groupName,
          group,
        }));
      }

      this.set('matchedGroups', matchedGroups);
    },
    removeMatch(groupName) {
      const matchedGroups = this.matchedGroups.toArray();
      const match = matchedGroups.findBy('name', groupName);
      if (match) {
        matchedGroups.removeObject(match);
      }

      this.set('matchedGroups', matchedGroups);
    },
    async createGroup(title) {
      const store = this.store;
      const learnerGroup = this.learnerGroup;
      const cohort = await learnerGroup.get('cohort');
      const group = store.createRecord('learner-group', {
        title,
        cohort,
        parent: learnerGroup
      });
      const savedGroup = await group.save();
      learnerGroup.get('children').pushObject(savedGroup);

      const matchedGroups = this.matchedGroups.toArray();
      matchedGroups.pushObject(EmberObject.create({
        name: title,
        group: savedGroup,
      }));

      this.set('matchedGroups', matchedGroups);
    },
    clear() {
      this.set('validUsers', null);
      this.set('matchedGroups', null);
    }
  },
});
