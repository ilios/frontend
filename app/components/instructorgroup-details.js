import Component from '@glimmer/component';
import { dropTask } from 'ember-concurrency';

export default class InstructorgroupDetailsComponent extends Component {
  @dropTask
  *addUser(user) {
    const users = yield this.args.instructorGroup.users;
    users.addObject(user);
    const groups = yield user.instructorGroups;
    groups.addObject(this.args.instructorGroup);
    yield this.args.instructorGroup.save();
  }

  @dropTask
  *removeUser(user) {
    const users = yield this.args.instructorGroup.users;
    users.removeObject(user);
    const groups = yield user.instructorGroups;
    groups.removeObject(this.args.instructorGroup);
    yield this.args.instructorGroup.save();
  }
}
