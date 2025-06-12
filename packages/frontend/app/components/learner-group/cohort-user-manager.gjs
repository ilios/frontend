import Component from '@glimmer/component';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { enqueueTask, timeout } from 'ember-concurrency';
import { uniqueId, fn } from '@ember/helper';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import pick from 'ilios-common/helpers/pick';
import set from 'ember-set-helper/helpers/set';
import and from 'ember-truth-helpers/helpers/and';
import includes from 'ilios-common/helpers/includes';
import not from 'ember-truth-helpers/helpers/not';
import SortableTh from 'ilios-common/components/sortable-th';
import or from 'ember-truth-helpers/helpers/or';
import eq from 'ember-truth-helpers/helpers/eq';
import sortBy from 'ilios-common/helpers/sort-by';
import FaIcon from 'ilios-common/components/fa-icon';
import UserNameInfo from 'ilios-common/components/user-name-info';
import UserStatus from 'ilios-common/components/user-status';
import LoadingSpinner from 'ilios-common/components/loading-spinner';
import perform from 'ember-concurrency/helpers/perform';
import gt from 'ember-truth-helpers/helpers/gt';

export default class LearnerGroupCohortUserManagerComponent extends Component {
  @service currentUser;

  @tracked filter = '';
  @tracked selectedUsers = [];
  @tracked usersBeingMoved = [];

  get sortedAscending() {
    return this.args.sortBy.search(/desc/) === -1;
  }

  get filteredUsers() {
    const filter = this.filter.trim().toLowerCase();

    if (!filter) {
      return this.args.users;
    }

    return this.args.users.filter((user) => {
      return (
        user.fullNameFromFirstLastName.trim().toLowerCase().includes(filter) ||
        user.fullName.trim().toLowerCase().includes(filter) ||
        user.email.trim().toLowerCase().includes(filter)
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

  @action
  toggleUserSelection(user) {
    if (this.selectedUsers.includes(user)) {
      this.selectedUsers = this.selectedUsers.filter((selectedUser) => selectedUser !== user);
    } else {
      this.selectedUsers = [...this.selectedUsers, user];
    }
  }

  @action
  toggleUserSelectionAllOrNone() {
    const unselectedFilteredUsers = this.filteredUsers.filter(
      (user) => !this.selectedUsers.includes(user),
    );
    if (this.filteredUsers && unselectedFilteredUsers.length) {
      this.selectedUsers = [...this.selectedUsers, ...unselectedFilteredUsers];
    } else {
      this.selectedUsers = [];
    }
  }

  addSingleUser = enqueueTask(async (user) => {
    this.usersBeingMoved = [...this.usersBeingMoved, user];
    //timeout gives the spinner time to render
    await timeout(1);
    await this.args.addUserToGroup(user);
    this.usersBeingMoved = this.usersBeingMoved.filter((movingUser) => movingUser !== user);
  });

  addSelectedUsers = enqueueTask(async () => {
    this.usersBeingMoved = [...this.usersBeingMoved, ...this.selectedUsers];
    //timeout gives the spinner time to render
    await timeout(1);
    await this.args.addUsersToGroup(this.selectedUsers);
    this.usersBeingMoved = this.usersBeingMoved.filter((user) => this.selectedUsers.includes(user));
    this.selectedUsers = [];
  });
  <template>
    {{#let (uniqueId) as |templateId|}}
      <div
        class="learner-group-cohort-user-manager"
        data-test-learner-group-cohort-user-manager
        ...attributes
      >
        <div class="learner-group-cohort-user-manager-header">
          <div class="title" data-test-title>
            {{t "general.cohortMembersNotInGroup" groupTitle=@topLevelGroupTitle}}
            ({{@users.length}})
          </div>
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
        </div>
        <div class="learner-group-cohort-user-manager-content">
          <div class="list">
            <table>
              <thead data-test-headers>
                <tr>
                  <th class="text-left" colspan="1">
                    {{#if @canUpdate}}
                      <input
                        type="checkbox"
                        checked={{and
                          (includes @users this.selectedUsers)
                          this.selectedUsers.length
                        }}
                        indeterminate={{and
                          (not (includes @users this.selectedUsers))
                          this.selectedUsers.length
                        }}
                        aria-label={{t "general.selectAllOrNone"}}
                        {{on "click" this.toggleUserSelectionAllOrNone}}
                      />
                    {{/if}}
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
                  <th class="text-left" colspan="1">
                    {{#if @canUpdate}}
                      {{t "general.actions"}}
                    {{/if}}
                  </th>
                </tr>
              </thead>
              <tbody data-test-users>
                {{#each (sortBy @sortBy this.filteredUsers) as |user index|}}
                  <tr class={{unless user.enabled "disabled-user-account"}}>
                    <td class="text-left" colspan="1">
                      {{#if @canUpdate}}
                        <input
                          type="checkbox"
                          checked={{includes user this.selectedUsers}}
                          aria-labelledby="username-{{index}}-{{templateId}}"
                          {{on "click" (fn this.toggleUserSelection user)}}
                        />
                      {{/if}}
                    </td>
                    <td class="text-left" colspan="4">
                      {{#if @canUpdate}}
                        <button
                          class="inline-button"
                          type="button"
                          {{on "click" (fn this.toggleUserSelection user)}}
                        >
                          <UserNameInfo id="username-{{index}}-{{templateId}}" @user={{user}} />
                          <UserStatus @user={{user}} />
                        </button>
                      {{else}}
                        <UserNameInfo id="username-{{index}}-{{templateId}}" @user={{user}} />
                        <UserStatus @user={{user}} />
                      {{/if}}
                    </td>
                    <td class="text-left" colspan="2">
                      {{#if @canUpdate}}
                        <button
                          class="inline-button"
                          type="button"
                          {{on "click" (fn this.toggleUserSelection user)}}
                        >
                          {{user.campusId}}
                        </button>
                      {{else}}
                        {{user.campusId}}
                      {{/if}}
                    </td>
                    <td class="text-left hide-from-small-screen" colspan="5">
                      {{#if @canUpdate}}
                        <button
                          class="inline-button"
                          type="button"
                          {{on "click" (fn this.toggleUserSelection user)}}
                        >
                          {{user.email}}
                        </button>
                      {{else}}
                        {{user.email}}
                      {{/if}}
                    </td>
                    <td class="text-left" colspan="1">
                      {{#if (includes user this.usersBeingMoved)}}
                        <LoadingSpinner />
                      {{else if (and @canUpdate (eq this.selectedUsers.length 0))}}
                        <button
                          type="button"
                          class="inline-button"
                          {{on "click" (perform this.addSingleUser user)}}
                          data-test-add-user
                        >
                          <FaIcon
                            @icon="plus"
                            class="yes"
                            @title={{t "general.moveToGroup" groupTitle=@learnerGroupTitle count=1}}
                          />
                        </button>
                      {{/if}}
                    </td>
                  </tr>
                {{/each}}
              </tbody>
            </table>
          </div>
        </div>
        {{#if (gt this.selectedUsers.length 0)}}
          <button type="button" class="done text" {{on "click" (perform this.addSelectedUsers)}}>
            {{t
              "general.moveToGroup"
              groupTitle=@learnerGroupTitle
              count=this.selectedUsers.length
            }}
          </button>
        {{/if}}
      </div>
    {{/let}}
  </template>
}
