import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { fn, uniqueId } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { LinkTo } from '@ember/routing';
import { service } from '@ember/service';
import { TrackedAsyncData } from 'ember-async-data';
import t from 'ember-intl/helpers/t';
import { eq, or } from 'ember-truth-helpers';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import SortableTh from 'ilios-common/components/sortable-th';
import UserNameInfo from 'ilios-common/components/user-name-info';
import sortBy from 'ilios-common/helpers/sort-by';
import { faCaretDown, faCaretRight } from '@fortawesome/free-solid-svg-icons';

export default class ProgramYearCohortMembersComponent extends Component {
  @service iliosConfig;
  @service intl;
  @tracked sortBy = 'fullName';

  @cached
  get membersData() {
    return new TrackedAsyncData(this.getMembers(this.args.programYear));
  }

  get members() {
    return this.membersData.isResolved ? this.membersData.value : [];
  }

  get hasMembers() {
    return !!this.members.length;
  }

  get sortedAscending() {
    return !this.sortBy.includes(':desc');
  }

  @action
  setSortBy(what) {
    if (this.sortBy === what) {
      what += ':desc';
    }
    this.sortBy = what;
  }

  async getMembers(programYear) {
    const cohort = await programYear.cohort;
    return await cohort.users;
  }

  <template>
    {{#let (uniqueId) as |templateId|}}
      <section class="program-year-cohort-members" data-test-program-year-cohort-members>
        {{#if this.membersData.isResolved}}
          <div class="header" data-test-header>
            <h2 class="title" data-test-title>
              {{#if this.hasMembers}}
                {{#if @isExpanded}}
                  <button
                    class="title link-button"
                    type="button"
                    aria-expanded="true"
                    aria-controls="content-{{templateId}}"
                    data-test-toggle
                    {{on "click" (fn @setIsExpanded false)}}
                  >
                    {{t "general.members"}}
                    ({{this.members.length}})
                    <FaIcon @icon={{faCaretDown}} />
                  </button>
                {{else}}
                  <button
                    class="title link-button"
                    type="button"
                    aria-expanded="false"
                    aria-controls="content-{{templateId}}"
                    data-test-toggle
                    {{on "click" (fn @setIsExpanded true)}}
                  >
                    {{t "general.members"}}
                    ({{this.members.length}})
                    <FaIcon @icon={{faCaretRight}} />
                  </button>
                {{/if}}
              {{else}}
                {{t "general.members"}}
                ({{this.members.length}})
              {{/if}}
            </h2>
          </div>
          {{#if this.hasMembers}}
            <div
              id="content-{{templateId}}"
              class="content{{if @isExpanded '' ' hidden'}}"
              data-test-content
              hidden={{@isExpanded}}
            >
              <table class="ilios-table ilios-table-colors ilios-zebra-table" data-test-members>
                <thead>
                  <tr>
                    <SortableTh
                      @sortedAscending={{this.sortedAscending}}
                      @onClick={{fn this.setSortBy "fullName"}}
                      @sortedBy={{or (eq this.sortBy "fullName") (eq this.sortBy "fullName:desc")}}
                    >
                      {{t "general.name"}}
                    </SortableTh>
                  </tr>
                </thead>
                <tbody>
                  {{#each (sortBy this.sortBy this.members) as |user|}}
                    <tr>
                      <td>
                        <LinkTo @route="user" @model={{user}} data-test-user-link>
                          <UserNameInfo @user={{user}} />
                        </LinkTo>
                      </td>
                    </tr>
                  {{/each}}
                </tbody>
              </table>
            </div>
          {{/if}}
        {{/if}}
      </section>
    {{/let}}
  </template>
}
