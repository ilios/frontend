import Component from '@glimmer/component';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';

export default class SelectedInstructorGroupMembersComponent extends Component {
  @cached
  get membersData() {
    return new TrackedAsyncData(this.args.instructorGroup.users);
  }

  get members() {
    return this.membersData.isResolved ? this.membersData.value : [];
  }
}

<ul
  class="selected-instructor-group-members"
  data-test-selected-instructor-group-members
  ...attributes
>
  {{#each (sort-by "fullName" this.members) as |user|}}
    <li data-test-selected-instructor-group-member>
      <UserNameInfo @user={{user}} />
    </li>
  {{/each}}
</ul>