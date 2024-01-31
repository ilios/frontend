import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { dropTask, timeout } from 'ember-concurrency';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';

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

  @dropTask
  *manage() {
    this.usersBuffer = (yield this.args.instructorGroup.users).slice();
    this.isManaging = true;
  }
  @dropTask
  *save() {
    yield timeout(10);
    this.args.instructorGroup.set('users', this.usersBuffer);
    yield this.args.instructorGroup.save();
    this.isManaging = false;
  }
}
