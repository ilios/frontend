import Component from '@glimmer/component';
import { dropTask, timeout } from 'ember-concurrency';
import { all, map } from 'rsvp';
import { service } from '@ember/service';
import { findBy, uniqueValues } from 'ilios-common/utils/array-helpers';

export default class LearnergroupBulkFinalizeUsersComponent extends Component {
  @service flashMessages;

  get finalData() {
    return this.args.users.map((obj) => {
      let selectedGroup = this.args.learnerGroup;
      if (obj.subGroupName) {
        const match = findBy(this.args.matchedGroups, 'name', obj.subGroupName);
        if (match) {
          selectedGroup = match.group;
        }
      }
      return {
        user: obj.userRecord,
        learnerGroup: selectedGroup,
      };
    });
  }

  save = dropTask(async () => {
    await timeout(10);
    const treeGroups = await map(this.finalData, async ({ learnerGroup, user }) => {
      return learnerGroup.addUserToGroupAndAllParents(user);
    });

    const flat = treeGroups.reduce((flattened, arr) => {
      return [...flattened, ...arr];
    }, []);

    await all(uniqueValues(flat).map((o) => o.save()));
    this.flashMessages.success('general.savedSuccessfully');
    this.args.done();
  });
}
