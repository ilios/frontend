import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
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
    const group = await this.store.find('learner-group', groupId);
    const matchedGroups = this.matchedGroups.slice();
    const match = findBy(matchedGroups, 'name', name);
    if (match) {
      match.group = group;
    } else {
      this.matchedGroups = [...this.matchedGroups, { name, group }];
    }
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
    const children = (await learnerGroup.children).slice();
    learnerGroup.set('children', [...children, savedGroup]);
    this.matchedGroups = [...this.matchedGroups, { name: title, group: savedGroup }];
  }

  @action
  clear() {
    this.validUsers = [];
    this.matchedGroups = [];
  }
}
