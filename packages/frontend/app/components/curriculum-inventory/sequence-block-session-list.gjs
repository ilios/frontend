import Component from '@glimmer/component';
import { action } from '@ember/object';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';

export default class SequenceBlockSessionListComponent extends Component {
  @cached
  get sessionsData() {
    return new TrackedAsyncData(this.args.sequenceBlock.sessions);
  }

  get sessions() {
    return this.sessionsData.isResolved ? this.sessionsData.value : [];
  }

  @cached
  get excludedSessionsData() {
    return new TrackedAsyncData(this.args.sequenceBlock.excludedSessions);
  }

  get excludedSessions() {
    return this.excludedSessionsData.isResolved ? this.excludedSessionsData.value : [];
  }

  get sortedAscending() {
    const sortBy = this.args.sortBy;
    return sortBy.search(/desc/) === -1;
  }

  @action
  changeSortOrder(what) {
    const sortBy = this.args.sortBy;
    if (sortBy === what) {
      what += ':desc';
    }
    this.args.setSortBy(what);
  }
}

<section
  class="curriculum-inventory-sequence-block-session-list"
  data-test-curriculum-inventory-sequence-block-session-list
  ...attributes
>
  <div class="sessions-list">
    <table>
      <thead>
        <tr>
          <th class="text-center" colspan="2">
            {{t "general.countAsOneOffering"}}
          </th>
          <th class="text-center" colspan="2">
            {{t "general.exclude"}}
          </th>
          <SortableTh
            @colspan={{3}}
            @onClick={{fn this.changeSortOrder "title"}}
            @sortedBy={{or (eq @sortBy "title") (eq @sortBy "title:desc")}}
            @sortedAscending={{this.sortedAscending}}
          >
            {{t "general.sessionTitle"}}
          </SortableTh>
          <SortableTh
            @colspan={{3}}
            @onClick={{fn this.changeSortOrder "sessionType.title"}}
            @sortedBy={{or (eq @sortBy "sessionType.title") (eq @sortBy "sessionType.title:desc")}}
            @sortedAscending={{this.sortedAscending}}
          >
            {{t "general.sessionType"}}
          </SortableTh>
          <th class="text-center" colspan="1">
            {{t "general.totalTime"}}
          </th>
          <SortableTh
            @colspan={{1}}
            @onClick={{fn this.changeSortOrder "offerings.length"}}
            @sortedBy={{or (eq @sortBy "offerings.length") (eq @sortBy "offerings.length:desc")}}
            @sortedAscending={{this.sortedAscending}}
            @sortType="numeric"
          >
            {{t "general.offerings"}}
          </SortableTh>
        </tr>
      </thead>
      <tbody>
        {{#each (sort-by @sortBy @sessions) as |session|}}
          <tr>
            <td class="text-center" colspan="2">
              {{if (includes session this.sessions) (t "general.yes") (t "general.no")}}
            </td>
            <td class="text-center" colspan="2">
              {{if (includes session this.excludedSessions) (t "general.yes") (t "general.no")}}
            </td>
            <td class="text-left" colspan="3">
              {{#if session.isIndependentLearning}}
                <strong>
                  ({{t "general.ilm"}})
                </strong>
              {{/if}}
              {{session.title}}
            </td>
            <td class="text-left" colspan="3">
              {{session.sessionType.title}}
            </td>
            <td class="text-center" colspan="1">
              {{#if (includes session this.sessions)}}
                {{session.maxDuration}}
              {{else}}
                {{session.totalSumDuration}}
              {{/if}}
            </td>
            <td class="text-center" colspan="1">
              {{session.offerings.length}}
            </td>
          </tr>
        {{/each}}
      </tbody>
    </table>
  </div>
</section>