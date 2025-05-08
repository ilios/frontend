import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { dropTask, timeout } from 'ember-concurrency';
import { TrackedAsyncData } from 'ember-async-data';

export default class InstructorGroupUsersComponent extends Component {
  @tracked usersBuffer = [];
  @tracked isManaging = false;

  @cached
  get usersData() {
    return new TrackedAsyncData(this.args.instructorGroup.users);
  }

  get users() {
    return this.usersData.isResolved ? this.usersData.value : [];
  }

  @action
  addUser(user) {
    this.usersBuffer = [...this.usersBuffer, user];
  }
  @action
  removeUser(user) {
    this.usersBuffer = this.usersBuffer.filter((obj) => obj !== user);
  }

  manage = dropTask(async () => {
    this.usersBuffer = await this.args.instructorGroup.users;
    this.isManaging = true;
  });

  save = dropTask(async () => {
    await timeout(10);
    this.args.instructorGroup.set('users', this.usersBuffer);
    await this.args.instructorGroup.save();
    this.isManaging = false;
  });
}
