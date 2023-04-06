import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { dropTask, timeout } from 'ember-concurrency';
import { use } from 'ember-could-get-used-to-this';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';

export default class InstructorGroupUsersComponent extends Component {
  @tracked usersBuffer = [];
  @tracked isManaging = false;

  @use users = new ResolveAsyncValue(() => [this.args.instructorGroup.users, []]);

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
