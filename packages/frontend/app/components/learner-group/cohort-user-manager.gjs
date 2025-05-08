{{#let (unique-id) as |templateId|}}
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
                <input
                  type="checkbox"
                  checked={{and (includes @users this.selectedUsers) this.selectedUsers.length}}
                  indeterminate={{and
                    (not (includes @users this.selectedUsers))
                    this.selectedUsers.length
                  }}
                  aria-label={{t "general.selectAllOrNone"}}
                  {{on "click" this.toggleUserSelectionAllOrNone}}
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
              <th class="text-left" colspan="1">
                {{t "general.actions"}}
              </th>
            </tr>
          </thead>
          <tbody data-test-users>
            {{#each (sort-by @sortBy this.filteredUsers) as |user index|}}
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
                  {{#if @canUpdate}}
                    <button
                      class="inline-button"
                      type="button"
                      {{on "click" (fn this.toggleUserSelection user)}}
                    >
                      <UserNameInfo id="username-{{index}}-{{templateId}}" @user={{user}} />
                    </button>
                  {{else}}
                    <UserNameInfo id="username-{{index}}-{{templateId}}" @user={{user}} />
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
        {{t "general.moveToGroup" groupTitle=@learnerGroupTitle count=this.selectedUsers.length}}
      </button>
    {{/if}}
  </div>
{{/let}}