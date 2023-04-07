import Component from '@glimmer/component';
import { use } from 'ember-could-get-used-to-this';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';

export default class LearnerGroupInstructorGroupMembersListComponent extends Component {
  @use membersResource = new ResolveAsyncValue(() => [this.args.instructorGroup.users]);

  get members() {
    return this.membersResource ? this.membersResource.slice() : [];
  }
}
