import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { enqueueTask, timeout } from 'ember-concurrency';

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
      return this.args.users;
    }
    return this.args.users.filter((user) => {
      return user.enabled;
    });
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
      (user) => !this.selectedUsers.includes(user)
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
}
