<div class="learner-group-bulk-assignment" data-test-learner-group-bulk-assignment ...attributes>
  {{#if this.validUsers}}
    <p>
      {{t "general.usersSelected" count=this.validUsers.length}}
      <br />
      <button type="button" {{on "click" this.clear}}>
        {{t "general.startOver"}}
      </button>
    </p>
    {{#if this.unmatchedGroups.length}}
      <table class="group-matcher" data-test-match-groups-unmatched>
        <caption>
          {{t "general.matchGroups"}}
        </caption>
        <thead>
          <tr>
            <td>
              {{t "general.uploadedGroup"}}
            </td>
            <td>
              {{t "general.existingGroup"}}
            </td>
          </tr>
        </thead>
        <tbody>
          {{#each this.unmatchedGroups as |name|}}
            <LearnerGroup::BulkGroupMatcher
              @groupName={{name}}
              @setMatch={{this.addMatch}}
              @unsetMatch={{this.removeMatch}}
              @createGroup={{this.createGroup}}
              @matches={{this.matchedGroups}}
              @groups={{sort-by "title" @learnerGroup.allDescendants}}
            />
          {{/each}}
        </tbody>
      </table>
    {{/if}}
    {{#if (and this.allUnmatchedGroupsMatched (gt this.validUsers.length 0))}}
      <LearnerGroup::BulkFinalizeUsers
        @users={{this.validUsers}}
        @matchedGroups={{this.matchedGroups}}
        @learnerGroup={{@learnerGroup}}
        @done={{@done}}
      />
    {{/if}}
  {{else}}
    <LearnerGroup::UploadData
      @learnerGroup={{@learnerGroup}}
      @sendValidUsers={{set this "validUsers"}}
      @sendMatchedGroups={{set this "matchedGroups"}}
    />
  {{/if}}
</div>