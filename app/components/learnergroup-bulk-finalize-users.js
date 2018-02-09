import Component from '@ember/component';
import { computed } from '@ember/object';
import { task, timeout } from 'ember-concurrency';
import { filter, map } from 'rsvp';
import { inject as service } from '@ember/service';
import { all } from 'rsvp';

export default Component.extend({
  flashMessages: service(),
  users: null,
  matchedGroups: null,
  learnerGroup: null,
  invalidUsers: computed('users.[]', 'learnerGroup', async function () {
    const users = this.get('users');
    const learnerGroup = this.get('learnerGroup');
    const allDescendantUsers = await learnerGroup.get('allDescendantUsers');
    const allDescendantUserIds = allDescendantUsers.mapBy('id');

    return filter(users, async user => allDescendantUserIds.includes(user.userRecord.get('id')));
  }),
  finalData: computed('users.[]', 'matchedGroups.[]', 'learnerGroup', function(){
    const users = this.get('users');
    const learnerGroup = this.get('learnerGroup');
    const matchedGroups = this.get('matchedGroups');
    const finalUsers = users.map(obj => {
      let selectedGroup = learnerGroup;
      if (obj.subGroupName) {
        const match = matchedGroups.findBy('name', obj.subGroupName);
        if (match) {
          selectedGroup = match.group;
        }
      }
      return {
        user: obj.userRecord,
        learnerGroup: selectedGroup
      };
    });

    return finalUsers;
  }),

  save: task(function* () {
    yield timeout(10);
    const finalData = this.get('finalData');
    const done = this.get('done');
    const flashMessages = this.get('flashMessages');
    const treeGroups = yield map(finalData, async ({ learnerGroup, user }) => {
      return learnerGroup.addUserToGroupAndAllParents(user);
    });

    const flat = treeGroups.reduce((flattened, arr) => {
      return flattened.pushObjects(arr);
    }, []);

    const groupsToSave = flat.uniq();
    yield all(groupsToSave.invoke('save'));
    flashMessages.success('general.savedSuccessfully');
    done();
  }),
});
