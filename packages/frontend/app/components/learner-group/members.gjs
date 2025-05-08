import Component from '@glimmer/component';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class LearnerGroupUserMembersComponent extends Component {
  @service currentUser;
  @tracked filter = '';

  get sortedAscending() {
    return this.args.sortBy.search(/desc/) === -1;
  }

  get usersInGroup() {
    return this.args.users.filter(
      (user) => user.get('lowestGroupInTree').id === this.args.learnerGroupId,
    );
  }

  get filteredUsers() {
    const users = this.usersInGroup;
    if (!users) {
      return [];
    }

    const filter = this.filter.trim().toLowerCase();
    if (!filter) {
      return users;
    }

    return users.filter((user) => {
      return (
        user.get('fullNameFromFirstLastName').trim().toLowerCase().includes(filter) ||
        user.get('fullName').trim().toLowerCase().includes(filter) ||
        user.get('email').trim().toLowerCase().includes(filter)
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
}
