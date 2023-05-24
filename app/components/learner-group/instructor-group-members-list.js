import Component from '@glimmer/component';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';

export default class LearnerGroupInstructorGroupMembersListComponent extends Component {
  @cached
  get membersData() {
    return new TrackedAsyncData(this.args.instructorGroup.users);
  }

  get members() {
    return this.membersData.isResolved ? this.membersData.value : [];
  }
}
