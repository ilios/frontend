import { on } from '@ember/modifier';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { task, timeout } from 'ember-concurrency';
import perform from 'ember-concurrency/helpers/perform';
import t from 'ember-intl/helpers/t';

import { findBy } from '../../utils/array-helpers';
import LoadingSpinner from '../loading-spinner';
import UserNameInfo from '../user-name-info';

export default class LearnerGroupBulkFinalizeUsersComponent extends Component {
  @service flashMessages;
  @service intl;
  @service fetch;
  @service store;

  get finalData() {
    return this.args.users.map((obj) => {
      const rhett = {
        user: obj.userRecord,
        learnerGroup: this.args.learnerGroup,
      };
      if (obj.subGroupName) {
        const match = findBy(this.args.matchedGroups, 'name', obj.subGroupName);
        if (match) {
          rhett.learnerGroup = match.group;
        } else {
          rhett.newGroupTitle = obj.subGroupName;
        }
      }
      return rhett;
    });
  }

  get newGroupsWithUsers() {
    return this.finalData
      .filter((obj) => obj.newGroupTitle)
      .reduce((groups, obj) => {
        groups[obj.newGroupTitle] ??= [];
        groups[obj.newGroupTitle].push(obj.user.id);
        return groups;
      }, {});
  }

  async putUsersInParentGroups(groups) {
    const userIds = Object.values(groups).flat();
    const users = await Promise.all(userIds.map((id) => this.store.findRecord('user', id)));
    const groupsToSave = await this.args.learnerGroup.addUsersToGroupAndAllParents(users);
    for (const group of groupsToSave) {
      await group.save();
    }
  }

  async saveNewGroups(groups) {
    await this.putUsersInParentGroups(groups);
    const data = Object.entries(groups).map(([title, userIds]) => ({
      type: 'learnerGroup',
      attributes: {
        title,
      },
      relationships: {
        users: {
          data: userIds.map((id) => ({
            type: 'user',
            id,
          })),
        },
        cohort: {
          data: {
            type: 'cohort',
            id: this.args.learnerGroup.belongsTo('cohort').id(),
          },
        },
        parent: {
          data: {
            type: 'learnerGroup',
            id: this.args.learnerGroup.id,
          },
        },
      },
    }));
    const newLearnerGroups = await this.fetch.postManyToApi(`learnergroups`, data);
    this.store.pushPayload(newLearnerGroups);
  }

  save = task({ drop: true }, async () => {
    await timeout(1);

    await this.saveNewGroups(this.newGroupsWithUsers);

    const existingGroupData = this.finalData.filter((obj) => obj.learnerGroup);

    for (const { learnerGroup, user } of existingGroupData) {
      const groups = await learnerGroup.addUserToGroupAndAllParents(user);
      for (const group of groups) {
        await group.save();
      }
    }

    this.flashMessages.success(this.intl.t('general.savedSuccessfully'), {
      capitalize: true,
    });
    this.args.done();
  });
  <template>
    <div class="bulk-finalize-users" data-test-learner-group-bulk-finalize-users ...attributes>
      <table class="ilios-table ilios-table-colors ilios-zebra-table" data-test-final-data>
        <caption>{{t "general.finalResults"}}</caption>
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
                {{#if obj.newGroupTitle}}
                  {{obj.newGroupTitle}}
                  ({{t "general.createNewGroup"}})
                {{else}}
                  {{obj.learnerGroup.title}}
                {{/if}}
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
