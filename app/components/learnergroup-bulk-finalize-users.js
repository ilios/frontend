import Component from '@glimmer/component';
import { dropTask, timeout } from 'ember-concurrency';
import { all, map } from 'rsvp';
import { inject as service } from '@ember/service';
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

  @dropTask
  *save() {
    yield timeout(10);
    const treeGroups = yield map(this.finalData, async ({ learnerGroup, user }) => {
      return learnerGroup.addUserToGroupAndAllParents(user);
    });

    const flat = treeGroups.reduce((flattened, arr) => {
      return flattened.pushObjects(arr);
    }, []);

    yield all(uniqueValues(flat).map((o) => o.save()));
    this.flashMessages.success('general.savedSuccessfully');
    this.args.done();
  }
}
