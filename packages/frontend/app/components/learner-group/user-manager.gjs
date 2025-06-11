import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { enqueueTask, timeout } from 'ember-concurrency';
import { mapBy } from 'ilios-common/utils/array-helpers';
import { uniqueId, fn, hash } from '@ember/helper';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import pick from 'ilios-common/helpers/pick';
import set from 'ember-set-helper/helpers/set';
import SortableTh from 'ilios-common/components/sortable-th';
import or from 'ember-truth-helpers/helpers/or';
import eq from 'ember-truth-helpers/helpers/eq';
import sortBy from 'ilios-common/helpers/sort-by';
import includes from 'ilios-common/helpers/includes';
import FaIcon from 'ilios-common/components/fa-icon';
import UserNameInfo from 'ilios-common/components/user-name-info';
import { LinkTo } from '@ember/routing';
import LoadingSpinner from 'ilios-common/components/loading-spinner';
import perform from 'ember-concurrency/helpers/perform';
import gt from 'ember-truth-helpers/helpers/gt';

export default class LearnerGroupUserManagerComponent extends Component {
  @tracked filter = '';
  @tracked selectedGroupUsers = [];
  @tracked selectedNonGroupUsers = [];
  @tracked usersBeingAddedToGroup = [];
  @tracked usersBeingRemovedFromGroup = [];

  get sortedAscending() {
    return this.args.sortBy.search(/desc/) === -1;
  }

  get selectableUsers() {
    return mapBy(this.args.users, 'content');
  }

  get filteredUsers() {
    if (!this.args.users) {
      return [];
    }
    const filter = this.filter.trim().toLowerCase();

    if (!filter) {
      return this.args.users;
    }

    return this.args.users.filter((user) => {
      return (
        user.get('fullNameFromFirstLastName').trim().toLowerCase().includes(filter) ||
        user.get('fullName').trim().toLowerCase().includes(filter) ||
        user.get('email').trim().toLowerCase().includes(filter)
      );
    });
  }

  get groupUsers() {
    return this.filteredUsers.filter(
      (user) => user.get('lowestGroupInTree').id === this.args.learnerGroupId,
    );
  }

  get nonGroupUsers() {
    return this.filteredUsers.filter(
      (user) => user.get('lowestGroupInTree').id !== this.args.learnerGroupId,
    );
  }

  get hasSelectedGroupUsers() {
    return !!this.selectedGroupUsers.length;
  }

  get hasSelectedNonGroupUsers() {
    return !!this.selectedNonGroupUsers.length;
  }

  get hasSomeSelectedGroupUsers() {
    return (
      this.hasSelectedGroupUsers &&
      !mapBy(this.groupUsers, 'content').every((user) => this.selectedGroupUsers.includes(user))
    );
  }

  get hasSomeSelectedNonGroupUsers() {
    return (
      this.hasSelectedNonGroupUsers &&
      !mapBy(this.nonGroupUsers, 'content').every((user) =>
        this.selectedNonGroupUsers.includes(user),
      )
    );
  }

  get hasAllSelectedGroupUsers() {
    return (
      this.hasSelectedGroupUsers &&
      mapBy(this.groupUsers, 'content').every((user) => this.selectedGroupUsers.includes(user))
    );
  }

  get hasAllSelectedNonGroupUsers() {
    return (
      this.hasSelectedNonGroupUsers &&
      mapBy(this.nonGroupUsers, 'content').every((user) =>
        this.selectedNonGroupUsers.includes(user),
      )
    );
  }

  @action
  setSortBy(what) {
    if (this.args.sortBy === what) {
      what += ':desc';
    }
    this.args.setSortBy(what);
  }

  @action
  toggleGroupUserSelection(user) {
    if (this.selectedGroupUsers.includes(user)) {
      this.selectedGroupUsers = this.selectedGroupUsers.filter(
        (selectedUser) => selectedUser !== user,
      );
    } else {
      this.selectedGroupUsers = [...this.selectedGroupUsers, user];
    }
  }

  @action
  toggleNonGroupUserSelection(user) {
    if (this.selectedNonGroupUsers.includes(user)) {
      this.selectedNonGroupUsers = this.selectedNonGroupUsers.filter(
        (selectedUser) => selectedUser !== user,
      );
    } else {
      this.selectedNonGroupUsers = [...this.selectedNonGroupUsers, user];
    }
  }

  @action
  toggleAllGroupUsersSelection() {
    if (!this.groupUsers.length) {
      return;
    }
    if (this.hasAllSelectedGroupUsers) {
      this.selectedGroupUsers = [];
    } else {
      this.selectedGroupUsers = [...mapBy(this.groupUsers, 'content')];
    }
  }

  @action
  toggleAllNonGroupUsersSelection() {
    if (!this.nonGroupUsers.length) {
      return;
    }
    if (this.hasAllSelectedNonGroupUsers) {
      this.selectedNonGroupUsers = [];
    } else {
      this.selectedNonGroupUsers = [...mapBy(this.nonGroupUsers, 'content')];
    }
  }

  addUserToGroup = enqueueTask(async (user) => {
    this.usersBeingAddedToGroup = [...this.usersBeingAddedToGroup, user];
    //timeout gives the spinner time to render
    await timeout(1);
    await this.args.addUserToGroup(user);
    this.usersBeingAddedToGroup = this.usersBeingAddedToGroup.filter(
      (movingUser) => movingUser !== user,
    );
  });

  removeUserFromGroup = enqueueTask(async (user) => {
    this.usersBeingRemovedFromGroup = [...this.usersBeingRemovedFromGroup, user];
    //timeout gives the spinner time to render
    await timeout(1);
    await this.args.removeUserFromGroup(user);
    this.usersBeingRemovedFromGroup = this.usersBeingRemovedFromGroup.filter(
      (movingUser) => movingUser !== user,
    );
  });

  addUsersToGroup = enqueueTask(async () => {
    this.usersBeingAddedToGroup = [...this.usersBeingAddedToGroup, ...this.selectedNonGroupUsers];
    //timeout gives the spinner time to render
    await timeout(1);
    await this.args.addUsersToGroup(this.selectedNonGroupUsers);
    this.usersBeingAddedToGroup = this.usersBeingAddedToGroup.filter((user) =>
      this.selectedNonGroupUsers.includes(user),
    );
    this.selectedNonGroupUsers = [];
  });

  removeUsersFromGroup = enqueueTask(async () => {
    this.usersBeingRemovedFromGroup = [
      ...this.usersBeingRemovedFromGroup,
      ...this.selectedGroupUsers,
    ];
    //timeout gives the spinner time to render
    await timeout(1);
    await this.args.removeUsersFromGroup(this.selectedGroupUsers);
    this.usersBeingRemovedFromGroup = this.usersBeingRemovedFromGroup.filter((user) =>
      this.selectedGroupUsers.includes(user),
    );
    this.selectedGroupUsers = [];
  });

  willDestroy() {
    super.willDestroy(...arguments);
    //undo selections
    this.selectedGroupUsers = [];
    this.selectedNonGroupUsers = [];
  }
  <template>
    {{#let (uniqueId) as |templateId|}}
      <div class="learner-group-user-manager" data-test-learner-group-user-manager ...attributes>
        {{#if @users.length}}
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
          <div class="learner-group-user-manager-content">
            <div class="list">
              <div class="title" data-test-group-members>
                {{t "general.groupMembers"}}
                ({{this.groupUsers.length}})
              </div>
              <table data-test-assigned-users>
                <thead>
                  <tr>
                    <th class="text-left" colspan="1">
                      <input
                        type="checkbox"
                        checked={{this.hasAllSelectedGroupUsers}}
                        indeterminate={{this.hasSomeSelectedGroupUsers}}
                        aria-label={{t "general.selectAllOrNone"}}
                        {{on "click" this.toggleAllGroupUsersSelection}}
                        data-test-toggle-all
                      />
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
                    <SortableTh
                      @colspan={{2}}
                      @onClick={{fn this.setSortBy "lowestGroupInTreeTitle"}}
                      @sortedBy={{or
                        (eq @sortBy "lowestGroupInTreeTitle")
                        (eq @sortBy "lowestGroupInTreeTitle:desc")
                      }}
                      @sortedAscending={{this.sortedAscending}}
                    >
                      {{t "general.groupName"}}
                    </SortableTh>
                    <th class="text-left" colspan="1">
                      {{t "general.actions"}}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {{#each (sortBy @sortBy this.groupUsers) as |user index|}}
                    <tr class={{unless user.enabled "disabled-user-account" ""}}>
                      <td class="text-left" colspan="1">
                        <input
                          aria-labelledby="selected-username-{{index}}-{{templateId}}"
                          type="checkbox"
                          checked={{includes user.content this.selectedGroupUsers}}
                          {{on "click" (fn this.toggleGroupUserSelection user.content)}}
                        />
                        {{#unless user.enabled}}
                          <FaIcon
                            @icon="user-xmark"
                            @title={{t "general.disabled"}}
                            class="disabled-user"
                            data-test-is-disabled
                          />
                        {{/unless}}
                      </td>
                      <td class="text-left" colspan="4">
                        <button
                          class="inline-button"
                          type="button"
                          {{on "click" (fn this.toggleGroupUserSelection user.content)}}
                        >
                          <UserNameInfo
                            id="selected-username-{{index}}-{{templateId}}"
                            @user={{user}}
                          />
                        </button>
                      </td>
                      <td class="text-left" colspan="2">
                        <button
                          class="inline-button"
                          type="button"
                          {{on "click" (fn this.toggleGroupUserSelection user.content)}}
                        >
                          {{user.campusId}}
                        </button>
                      </td>
                      <td class="text-left hide-from-small-screen" colspan="5">
                        <button
                          class="inline-button"
                          type="button"
                          {{on "click" (fn this.toggleGroupUserSelection user.content)}}
                        >
                          {{user.email}}
                        </button>
                      </td>
                      <td class="text-left" colspan="2" data-test-learnergroup>
                        <LinkTo
                          @route="learner-group"
                          @model={{user.lowestGroupInTree}}
                          @query={{hash isEditing=true sortUsersBy=@sortBy}}
                          title={{user.lowestGroupInTree.titleWithParentTitles}}
                          aria-label={{user.lowestGroupInTree.titleWithParentTitles}}
                        >
                          {{user.lowestGroupInTree.title}}
                        </LinkTo>
                      </td>
                      <td>
                        {{#if (includes user.content this.usersBeingRemovedFromGroup)}}
                          <LoadingSpinner />
                        {{else}}
                          {{#if (eq this.selectedGroupUsers.length 0)}}
                            <button
                              type="button"
                              class="link-button"
                              {{on "click" (perform this.removeUserFromGroup user.content)}}
                              data-test-remove-user
                            >
                              <FaIcon
                                @icon="minus"
                                class="no"
                                @title={{t
                                  "general.removeLearnerToCohort"
                                  cohort=@cohortTitle
                                  count=1
                                }}
                              />
                            </button>
                          {{/if}}
                        {{/if}}
                      </td>
                    </tr>
                  {{/each}}
                </tbody>
              </table>
              <div class="title" data-test-all-other-members>
                {{t "general.allOtherMembers" topLevelGroupTitle=@topLevelGroupTitle}}
                ({{this.nonGroupUsers.length}})
              </div>
              <table data-test-assignable-users>
                <thead>
                  <tr>
                    <th class="text-left" colspan="1">
                      <input
                        type="checkbox"
                        checked={{this.hasAllSelectedNonGroupUsers}}
                        indeterminate={{this.hasSomeSelectedNonGroupUsers}}
                        aria-label={{t "general.selectAllOrNone"}}
                        {{on "click" this.toggleAllNonGroupUsersSelection}}
                        data-test-toggle-all
                      />
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
                    <SortableTh
                      @colspan={{2}}
                      @onClick={{fn this.setSortBy "lowestGroupInTreeTitle"}}
                      @sortedBy={{or
                        (eq @sortBy "lowestGroupInTreeTitle")
                        (eq @sortBy "lowestGroupInTreeTitle:desc")
                      }}
                      @sortedAscending={{this.sortedAscending}}
                    >
                      {{t "general.groupName"}}
                    </SortableTh>
                    <th class="text-left" colspan="1">
                      {{t "general.actions"}}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {{#each (sortBy @sortBy this.nonGroupUsers) as |user index|}}
                    <tr class={{unless user.enabled "disabled-user-account" ""}}>
                      <td class="text-left" colspan="1">
                        <input
                          aria-labelledby="cohort-username-{{index}}-{{templateId}}"
                          type="checkbox"
                          checked={{includes user.content this.selectedNonGroupUsers}}
                          {{on "click" (fn this.toggleNonGroupUserSelection user.content)}}
                        />
                        {{#unless user.enabled}}
                          <FaIcon
                            @icon="user-xmark"
                            @title={{t "general.disabled"}}
                            class="disabled-user"
                            data-test-is-disabled
                          />
                        {{/unless}}
                      </td>
                      <td class="text-left" colspan="4">
                        <button
                          class="inline-button"
                          type="button"
                          {{on "click" (fn this.toggleNonGroupUserSelection user.content)}}
                        >
                          <UserNameInfo
                            id="cohort-username-{{index}}-{{templateId}}"
                            @user={{user}}
                          />
                        </button>
                      </td>
                      <td class="text-left" colspan="2">
                        <button
                          class="inline-button"
                          type="button"
                          {{on "click" (fn this.toggleNonGroupUserSelection user.content)}}
                        >
                          {{user.campusId}}
                        </button>
                      </td>
                      <td class="text-left hide-from-small-screen" colspan="5">
                        <button
                          class="inline-button"
                          type="button"
                          {{on "click" (fn this.toggleNonGroupUserSelection user.content)}}
                        >
                          {{user.email}}
                        </button>
                      </td>
                      <td class="text-left" colspan="2" data-test-learnergroup>
                        <LinkTo
                          @route="learner-group"
                          @model={{user.lowestGroupInTree}}
                          @query={{hash isEditing=true sortUsersBy=@sortBy}}
                          title={{user.lowestGroupInTree.titleWithParentTitles}}
                          aria-label={{user.lowestGroupInTree.titleWithParentTitles}}
                        >
                          {{user.lowestGroupInTree.title}}
                        </LinkTo>
                      </td>
                      <td>
                        {{#if (includes user.content this.usersBeingAddedToGroup)}}
                          <LoadingSpinner />
                        {{else if (eq this.selectedNonGroupUsers.length 0)}}
                          <button
                            type="button"
                            class="link-button"
                            {{on "click" (perform this.addUserToGroup user.content)}}
                            data-test-add-user
                          >
                            <FaIcon
                              @icon="plus"
                              class="yes"
                              @title={{t
                                "general.moveToGroup"
                                groupTitle=@learnerGroupTitle
                                count=1
                              }}
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
          <p class="fullwidth">
            {{#if (gt this.selectedNonGroupUsers.length 0)}}
              <button type="button" class="done text" {{on "click" (perform this.addUsersToGroup)}}>
                {{t
                  "general.moveToGroup"
                  groupTitle=@learnerGroupTitle
                  count=this.selectedNonGroupUsers.length
                }}
              </button>
            {{/if}}
            {{#if (gt this.selectedGroupUsers.length 0)}}
              <button
                type="button"
                class="cancel text"
                {{on "click" (perform this.removeUsersFromGroup)}}
              >
                {{t
                  "general.removeLearnerToCohort"
                  cohort=@cohortTitle
                  count=this.selectedGroupUsers.length
                }}
              </button>
            {{/if}}
          </p>
        {{/if}}
      </div>
    {{/let}}
  </template>
}
