import Component from '@glimmer/component';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class LearnerGroupUserMembersComponent extends Component {
  @service currentUser;
  @tracked filter = '';

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
}

{{#let (unique-id) as |templateId|}}
  <div
    class="learner-group-members{{if (eq this.usersInGroup.length 0) ' empty'}}"
    data-test-learner-group-members
  >
    {{#if this.usersInGroup.length}}
      <div class="actions">
        <input
          type="text"
          value={{this.filter}}
          placeholder={{t "general.filterByNameOrEmail"}}
          aria-label={{t "general.filterByNameOrEmail"}}
          {{on "input" (pick "target.value" (set this "filter"))}}
          data-test-filter
        />
      </div>
      <div class="learner-group-members-content">
        <div class="list">
          <table>
            <thead>
              <tr>
                <th class="text-left" colspan="1">
                </th>
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
              {{#each (sort-by @sortBy this.filteredUsers) as |user index|}}
                <tr class={{unless user.enabled "disabled-user-account" ""}}>
                  <td class="text-left" colspan="1">
                    {{#unless user.enabled}}
                      <FaIcon
                        @icon="user-xmark"
                        @title={{t "general.disabled"}}
                        class="error"
                        data-test-is-disabled
                      />
                    {{/unless}}
                  </td>
                  <td class="text-left" colspan="4">
                    <UserNameInfo id="selected-username-{{index}}-{{templateId}}" @user={{user}} />
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