{{#let (unique-id) as |templateId|}}
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
              {{#each (sort-by @sortBy this.groupUsers) as |user index|}}
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
                        class="error"
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
                            @title={{t "general.removeLearnerToCohort" cohort=@cohortTitle count=1}}
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
              {{#each (sort-by @sortBy this.nonGroupUsers) as |user index|}}
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
                        class="error"
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
                      <UserNameInfo id="cohort-username-{{index}}-{{templateId}}" @user={{user}} />
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