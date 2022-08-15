import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { dropTask, timeout } from 'ember-concurrency';

export default class InstructorGroupUsersComponent extends Component {
  @tracked users = [];
  @tracked isManaging = false;

  @action
  addUser(user) {
    this.users = [...this.users, user];
  }
  @action
  removeUser(user) {
    this.users = this.users.filter((obj) => obj !== user);
  }

  @dropTask
  *manage() {
    this.users = (yield this.args.instructorGroup.users).toArray();
    this.isManaging = true;
  }
  @dropTask
  *save() {
    yield timeout(10);
    this.args.instructorGroup.set('users', this.users);
    yield this.args.instructorGroup.save();
    this.isManaging = false;
  }
}
