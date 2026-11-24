import { fn } from '@ember/helper';
import { action } from '@ember/object';
import { LinkTo } from '@ember/routing';
import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import t from 'ember-intl/helpers/t';
import { eq, or } from 'ember-truth-helpers';

import LoadingSpinner from './loading-spinner';
import SortableTh from './sortable-th';
import UserNameInfo from './user-name-info';
import UserStatus from './user-status';

export default class UserListComponent extends Component {
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

  get limit() {
    return this.args.limit ? parseInt(this.args.limit, 10) : 0;
  }

  get sortedUsers() {
    if (this.args.users) {
      return this.args.users;
    }
    // KLUDGE
    // adjust for over-fetching in the results returned from the `IliosUserComponents::searchForUsers` task.
    // if we're on the code path where we're getting the user data from there,
    // then we must snip the over-fetched users off list before display.
    // TODO: patch this properly upstream [ST 2026/11/23]
    const rhett = this.sortedUsersData.isResolved ? this.sortedUsersData.value : [];
    if (rhett.length > this.limit) {
      return rhett.slice(0, this.limit);
    }
    return rhett;
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
    <table
      class="ilios-table ilios-table-colors ilios-zebra-table user-list{{if
          @headerIsLocked
          ' sticky-header'
        }}"
      data-test-user-list
      ...attributes
    >
      <thead data-test-user-list-header>
        <tr>
          <SortableTh
            @align="left"
            @colspan={{3}}
            @sortedAscending={{this.sortedAscending}}
            @onClick={{fn this.setSortBy "fullName"}}
            @sortedBy={{or (eq @sortBy "fullName") (eq @sortBy "fullName:desc")}}
            data-test-name
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
            data-test-campus-id
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
            data-test-email
          >
            {{t "general.email"}}
          </SortableTh>
          <th colspan="2" class="hide-from-small-screen" data-test-school>{{t
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
