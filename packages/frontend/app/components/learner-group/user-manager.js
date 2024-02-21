import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { enqueueTask, timeout } from 'ember-concurrency';
import { mapBy } from 'ilios-common/utils/array-helpers';

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
}
