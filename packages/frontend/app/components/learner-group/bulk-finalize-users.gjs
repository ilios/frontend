import Component from '@glimmer/component';
import { task, timeout } from 'ember-concurrency';
import { all, map } from 'rsvp';
import { service } from '@ember/service';
import { findBy, uniqueValues } from 'ilios-common/utils/array-helpers';
import t from 'ember-intl/helpers/t';
import UserNameInfo from 'ilios-common/components/user-name-info';
import { on } from '@ember/modifier';
import perform from 'ember-concurrency/helpers/perform';
import LoadingSpinner from 'ilios-common/components/loading-spinner';

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

  save = task({ drop: true }, async () => {
    await timeout(10);
    const treeGroups = await map(this.finalData, async ({ learnerGroup, user }) => {
      return learnerGroup.addUserToGroupAndAllParents(user);
    });

    const flat = treeGroups.reduce((flattened, arr) => {
      return [...flattened, ...arr];
    }, []);

    await all(uniqueValues(flat).map((o) => o.save()));
    this.flashMessages.success('general.savedSuccessfully', {
      capitalize: true,
    });
    this.args.done();
  });
  <template>
    <div class="bulk-finalize-users" data-test-learner-group-bulk-finalize-users ...attributes>
      <h2>
        {{t "general.finalResults"}}
      </h2>
      <table data-test-final-data>
        <thead>
          <tr>
            <th>
              {{t "general.name"}}
            </th>
            <th>
              {{t "general.campusId"}}
            </th>
            <th>
              {{t "general.learnerGroups"}}
            </th>
          </tr>
        </thead>
        <tbody>
          {{#each this.finalData as |obj|}}
            <tr>
              <td>
                <UserNameInfo @user={{obj.user}} />
              </td>
              <td>
                {{obj.user.campusId}}
              </td>
              <td>
                {{obj.learnerGroup.title}}
              </td>
            </tr>
          {{/each}}
        </tbody>
      </table>
      <button
        type="button"
        disabled={{this.save.isRunning}}
        data-test-finalize-users-submit
        {{on "click" (perform this.save)}}
      >
        {{#if this.save.isRunning}}
          <LoadingSpinner />
        {{else}}
          {{t "general.save"}}
        {{/if}}
      </button>
    </div>
  </template>
}
