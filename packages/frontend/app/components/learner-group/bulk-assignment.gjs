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
