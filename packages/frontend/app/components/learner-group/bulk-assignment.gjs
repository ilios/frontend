import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { isEmpty, isPresent } from '@ember/utils';
import { findBy, mapBy, uniqueValues } from 'ilios-common/utils/array-helpers';

export default class LearnerGroupBulkAssignmentComponent extends Component {
  @service store;
  @tracked user;
  @tracked validUsers = [];
  @tracked matchedGroups = [];

  get unmatchedGroups() {
    return uniqueValues(mapBy(this.validUsers, 'subGroupName')).filter((str) => isPresent(str));
  }

  get allUnmatchedGroupsMatched() {
    return !this.unmatchedGroups.filter((groupName) => {
      return isEmpty(findBy(this.matchedGroups, 'name', groupName));
    }).length;
  }

  @action
  async addMatch(name, groupId) {
    const group = await this.store.findRecord('learner-group', groupId);
    const matchedGroups = this.matchedGroups;
    const match = findBy(matchedGroups, 'name', name);
    if (match) {
      this.removeMatch(name);
    }
    this.matchedGroups = [...this.matchedGroups, { name, group }];
  }

  @action
  removeMatch(name) {
    this.matchedGroups = this.matchedGroups.filter((group) => {
      return group.name !== name;
    });
  }

  @action
  async createGroup(title) {
    const learnerGroup = this.args.learnerGroup;
    const cohort = await learnerGroup.cohort;
    const group = this.store.createRecord('learner-group', {
      title,
      cohort,
      parent: learnerGroup,
    });
    const savedGroup = await group.save();
    this.matchedGroups = [...this.matchedGroups, { name: title, group: savedGroup }];
  }

  @action
  clear() {
    this.validUsers = [];
    this.matchedGroups = [];
  }
}

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