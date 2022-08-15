import Component from '@glimmer/component';
import { dropTask } from 'ember-concurrency';

export default class InstructorGroupRootComponent extends Component {
  @dropTask
  *addUser(user) {
    const users = yield this.args.instructorGroup.users;
    users.addObject(user);
    yield this.args.instructorGroup.save();
  }

  @dropTask
  *removeUser(user) {
    const users = yield this.args.instructorGroup.users;
    users.removeObject(user);
    yield this.args.instructorGroup.save();
  }
}
