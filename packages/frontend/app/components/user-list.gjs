import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { action } from '@ember/object';
import { fn } from '@ember/helper';
import or from 'ember-truth-helpers/helpers/or';
import eq from 'ember-truth-helpers/helpers/eq';
import t from 'ember-intl/helpers/t';
import { LinkTo } from '@ember/routing';
import { TrackedAsyncData } from 'ember-async-data';
import UserStatus from 'ilios-common/components/user-status';
import UserNameInfo from 'ilios-common/components/user-name-info';
import SortableTh from 'ilios-common/components/sortable-th';
import LoadingSpinner from 'ilios-common/components/loading-spinner';

export default class UserList extends Component {
  get sortedAscending() {
    return this.args.sortBy.search(/desc/) === -1;
  }

  @cached
  get sortedUsersData() {
    return new TrackedAsyncData(
      this.args.searchForUsers.perform(
        this.sortInfo.column,
        this.sortInfo.descending ? 'DESC' : 'ASC',
      ),
    );
  }

  get sortedUsers() {
    if (this.args.users) {
      return this.args.users;
    }
    return this.sortedUsersData.isResolved ? this.sortedUsersData.value : [];
  }

  get sortInfo() {
    const parts = this.args.sortBy.split(':');
    const column = parts[0];
    const descending = parts.length > 1 && parts[1] === 'desc';

    return { column, descending, sortBy: this.args.sortBy };
  }

  @action
  setSortBy(what) {
    if (this.args.sortBy === what) {
      what += ':desc';
    }
    this.args.setSortBy(what);
  }
  <template>
    <table class="ilios-zebra-table user-list" data-test-user-list ...attributes>
      <thead class={{if @headerIsLocked "locked"}}>
        <tr>
          <SortableTh
            @align="left"
            @colspan={{3}}
            @sortedAscending={{this.sortedAscending}}
            @onClick={{fn this.setSortBy "fullName"}}
            @sortedBy={{or (eq @sortBy "fullName") (eq @sortBy "fullName:desc")}}
          >
            {{t "general.fullName"}}
          </SortableTh>
          <SortableTh
            class="hide-from-small-screen"
            @align="left"
            @colspan={{2}}
            @sortedAscending={{this.sortedAscending}}
            @onClick={{fn this.setSortBy "campusId"}}
            @sortedBy={{or (eq @sortBy "campusId") (eq @sortBy "campusId:desc")}}
          >
            {{t "general.campusId"}}
          </SortableTh>
          <SortableTh
            class="hide-from-small-screen"
            @align="left"
            @colspan={{5}}
            @sortedAscending={{this.sortedAscending}}
            @onClick={{fn this.setSortBy "email"}}
            @sortedBy={{or (eq @sortBy "email") (eq @sortBy "email:desc")}}
          >
            {{t "general.email"}}
          </SortableTh>
          <th colspan="2" class="hide-from-small-screen" data-test-user-list-school>{{t
              "general.primarySchool"
            }}</th>
        </tr>
      </thead>
      <tbody>
        {{#if (or @users this.sortedUsersData.isResolved)}}
          {{#if this.sortedUsers.length}}
            {{#each this.sortedUsers as |user|}}
              <tr
                class="user-list-row{{unless user.enabled ' disabled-user-account'}}"
                data-test-user
              >
                <td colspan="3" class="text-left" data-test-full-name>
                  <LinkTo @route="user" @model={{user}} data-test-user-link>
                    <UserNameInfo @user={{user}} />
                  </LinkTo>
                  <UserStatus @user={{user}} />
                </td>
                <td colspan="2" class="text-left hide-from-small-screen" data-test-campus-id>
                  {{user.campusId}}
                </td>
                <td colspan="5" class="text-left hide-from-small-screen" data-test-email>
                  {{user.email}}
                </td>
                <td colspan="2" class="text-left hide-from-small-screen" data-test-school>
                  {{user.school.title}}
                </td>
              </tr>
            {{/each}}
          {{else}}
            <tr>
              <td colspan="13" class="no-results">
                {{t "general.noResultsFound"}}
              </td>
            </tr>
          {{/if}}
        {{else}}
          <LoadingSpinner />
        {{/if}}
      </tbody>
    </table>
  </template>
}
