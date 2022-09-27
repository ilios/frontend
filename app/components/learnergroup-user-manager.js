import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { enqueueTask, timeout } from 'ember-concurrency';
import { mapBy } from 'ilios-common/utils/array-helpers';

export default class LearnergroupCohortUserManagerComponent extends Component {
  @service currentUser;

  @tracked filter = '';
  @tracked selectedUsers = [];
  @tracked usersBeingMoved = [];

  get sortedAscending() {
    return this.args.sortBy.search(/desc/) === -1;
  }

  get selectableUsers() {
    if (this.currentUser.isRoot) {
      return mapBy(this.args.users, 'content');
    }
    return mapBy(
      this.args.users.filter((user) => {
        return user.get('enabled');
      }),
      'content'
    );
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

  get usersInCurrentGroup() {
    if (!this.args.isEditing) {
      return this.filteredUsers;
    }
    return this.filteredUsers.filter(
      (user) => user.get('lowestGroupInTree').id === this.args.learnerGroupId
    );
  }

  get usersNotInCurrentGroup() {
    return this.filteredUsers.filter(
      (user) => user.get('lowestGroupInTree').id !== this.args.learnerGroupId
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
  toggleUserSelection(user) {
    if (this.selectedUsers.includes(user)) {
      this.selectedUsers = this.selectedUsers.filter((selectedUser) => selectedUser !== user);
    } else {
      this.selectedUsers = [...this.selectedUsers, user];
    }
  }

  @action
  toggleUserSelectionAllOrNone() {
    const filteredUsers = mapBy(this.filteredUsers, 'content');
    const unselectedFilteredUsers = filteredUsers.filter((user) => {
      return !this.selectedUsers.includes(user);
    });
    if (this.filteredUsers && unselectedFilteredUsers.length) {
      this.selectedUsers = [...this.selectedUsers, ...unselectedFilteredUsers];
    } else {
      this.selectedUsers = [];
    }
  }

  @enqueueTask
  *addSingleUser(user) {
    this.usersBeingMoved = [...this.usersBeingMoved, user];
    //timeout gives the spinner time to render
    yield timeout(1);
    yield this.args.addUserToGroup(user);
    this.usersBeingMoved = this.usersBeingMoved.filter((movingUser) => movingUser !== user);
  }

  @enqueueTask
  *removeSingleUser(user) {
    this.usersBeingMoved = [...this.usersBeingMoved, user];
    //timeout gives the spinner time to render
    yield timeout(1);
    yield this.args.removeUserFromGroup(user);
    this.usersBeingMoved = this.usersBeingMoved.filter((movingUser) => movingUser !== user);
  }

  @enqueueTask
  *addSelectedUsers() {
    this.usersBeingMoved = [...this.usersBeingMoved, ...this.selectedUsers];
    //timeout gives the spinner time to render
    yield timeout(1);
    yield this.args.addUsersToGroup(this.selectedUsers);
    this.usersBeingMoved = this.usersBeingMoved.filter((user) => this.selectedUsers.includes(user));
    this.selectedUsers = [];
  }

  @enqueueTask
  *removeSelectedUsers() {
    this.usersBeingMoved = [...this.usersBeingMoved, ...this.selectedUsers];
    //timeout gives the spinner time to render
    yield timeout(1);
    yield this.args.removeUsersFromGroup(this.selectedUsers);
    this.usersBeingMoved = this.usersBeingMoved.filter((user) => this.selectedUsers.includes(user));
    this.selectedUsers = [];
  }
}
