import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { uniqueId, fn } from '@ember/helper';
import eq from 'ember-truth-helpers/helpers/eq';
import t from 'ember-intl/helpers/t';
import SortableTh from 'ilios-common/components/sortable-th';
import or from 'ember-truth-helpers/helpers/or';
import sortBy from 'ilios-common/helpers/sort-by';
import UserNameInfo from 'ilios-common/components/user-name-info';
import UserStatus from 'ilios-common/components/user-status';

export default class LearnerGroupUserMembersComponent extends Component {
  @service currentUser;

  get filter() {
    return this.args.filter ?? '';
  }

  get sortedAscending() {
    return this.args.sortBy.search(/desc/) === -1;
  }

  get usersInGroup() {
    return this.args.users.filter(
      (user) => user.get('lowestGroupInTree').id === this.args.learnerGroupId,
    );
  }

  get filteredUsers() {
    const users = this.usersInGroup;
    if (!users) {
      return [];
    }

    const filter = this.filter.trim().toLowerCase();
    if (!filter) {
      return users;
    }

    return users.filter((user) => {
      return (
        user.get('fullNameFromFirstLastName').trim().toLowerCase().includes(filter) ||
        user.get('fullName').trim().toLowerCase().includes(filter) ||
        user.get('email').trim().toLowerCase().includes(filter)
      );
    });
  }

  @action
  setSortBy(what) {
    if (this.args.sortBy === what) {
      what += ':desc';
    }
    this.args.setSortBy(what);
  }
  <template>
    {{#let (uniqueId) as |templateId|}}
      <div
        class="learner-group-members{{if (eq this.usersInGroup.length 0) ' empty'}}"
        data-test-learner-group-members
      >
        {{#if this.usersInGroup.length}}
          <div class="learner-group-members-content">
            <div class="list">
              <table class="ilios-zebra-table">
                <thead>
                  <tr>
                    <SortableTh
                      @colspan={{4}}
                      @onClick={{fn this.setSortBy "fullName"}}
                      @sortedBy={{or (eq @sortBy "fullName") (eq @sortBy "fullName:desc")}}
                      @sortedAscending={{this.sortedAscending}}
                    >
                      {{t "general.name"}}
                    </SortableTh>
                    <th class="text-left" colspan="2">
                      {{t "general.campusId"}}
                    </th>
                    <th class="text-left hide-from-small-screen" colspan="5">
                      {{t "general.email"}}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {{#each (sortBy @sortBy this.filteredUsers) as |user index|}}
                    <tr class={{unless user.enabled "disabled-user-account" ""}}>
                      <td class="text-left" colspan="4">
                        <UserNameInfo
                          id="selected-username-{{index}}-{{templateId}}"
                          @user={{user}}
                        />
                        <UserStatus @user={{user}} />
                      </td>
                      <td class="text-left" colspan="2">
                        {{user.campusId}}
                      </td>
                      <td class="text-left hide-from-small-screen" colspan="5">
                        {{user.email}}
                      </td>
                    </tr>
                  {{/each}}
                </tbody>
              </table>
            </div>
          </div>
        {{/if}}
      </div>
    {{/let}}
  </template>
}
