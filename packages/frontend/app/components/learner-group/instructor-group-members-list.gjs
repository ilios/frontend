import Component from '@glimmer/component';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import sortBy from 'ilios-common/helpers/sort-by';
import UserNameInfo from 'ilios-common/components/user-name-info';

export default class LearnerGroupInstructorGroupMembersListComponent extends Component {
  @cached
  get membersData() {
    return new TrackedAsyncData(this.args.instructorGroup.users);
  }

  get members() {
    return this.membersData.isResolved ? this.membersData.value : [];
  }
  <template>
    <ul
      class="learner-group-instructor-group-members-list"
      data-test-learner-group-instructor-group-members-list
      ...attributes
    >
      {{#each (sortBy "fullName" this.members) as |user|}}
        <li data-test-instructor-group-member>
          <UserNameInfo @user={{user}} />
        </li>
      {{/each}}
    </ul>
  </template>
}
