import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { enqueueTask } from 'ember-concurrency-decorators';
import { timeout } from 'ember-concurrency';

export default class LearnergroupCohortUserManagerComponent extends Component {
  @service currentUser;

  @tracked filter = '';
  @tracked selectedUsers = [];
  @tracked usersBeingMoved = [];

  get sortedAscending() {
    return this.args.sortBy.search(/desc/) === -1;
  }

  get filteredUsers() {
    const filter = this.filter.toLowerCase();

    if (!filter){
      return this.args.users;
    }

    return this.args.users.filter((user) => {
      return user.firstName.toLowerCase().includes(filter) ||
        user.lastName.toLowerCase().includes(filter) ||
        user.email.toLowerCase().includes(filter);
    });
  }

  @action
  setSortBy(what) {
    if(this.args.sortBy === what){
      what += ':desc';
    }
    this.args.setSortBy(what);
  }

  @action
  toggleUserSelection(user) {
    if (this.selectedUsers.includes(user)) {
      this.selectedUsers = this.selectedUsers.filter(selectedUser => selectedUser !== user);
    } else {
      this.selectedUsers = [...this.selectedUsers, user];
    }
  }

  @action
  toggleUserSelectionAllOrNone() {
    const selectedUsers = this.selectedUsers.length;
    const filteredUsers = this.filteredUsers.length;

    if (selectedUsers >= filteredUsers) {
      this.selectedUsers = [];
    } else {
      this.selectedUsers = [...this.selectedUsers, ...this.filteredUsers];
    }
  }

  @enqueueTask
  *addSingleUser(user) {
    this.usersBeingMoved = [...this.usersBeingMoved, user];
    //timeout gives the spinner time to render
    yield timeout(1);
    yield this.args.addUserToGroup(user);
    this.usersBeingMoved = this.usersBeingMoved.filter(movingUser => movingUser !== user);
  }

  @enqueueTask
  *addSelectedUsers() {
    this.usersBeingMoved = [...this.usersBeingMoved, ...this.selectedUsers];
    //timeout gives the spinner time to render
    yield timeout(1);
    yield this.args.addUsersToGroup(this.selectedUsers);
    this.usersBeingMoved = this.usersBeingMoved.filter(user => this.selectedUsers.includes(user));
    this.selectedUsers = [];
  }
}
