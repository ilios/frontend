import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';

export default class LearnerGroupListComponent extends Component {
  @service intl;

  get sortedAscending() {
    return !this.args.sortBy.includes(':desc');
  }

  @action
  setSortBy(what) {
    if (this.args.sortBy === what) {
      what += ':desc';
    }
    this.args.setSortBy(what);
  }

  @action
  sortByTitle(learnerGroupA, learnerGroupB) {
    const locale = this.intl.get('primaryLocale');
    if ('title:desc' === this.args.sortBy) {
      return learnerGroupB.title.localeCompare(learnerGroupA.title, locale, { numeric: true });
    }
    return learnerGroupA.title.localeCompare(learnerGroupB.title, locale, { numeric: true });
  }
}

{{#if @learnerGroups.length}}
  <table class="learner-group-list" data-test-learner-group-list ...attributes>
    <thead>
      <tr>
        <SortableTh
          @colspan={{2}}
          @sortedAscending={{this.sortedAscending}}
          @onClick={{fn this.setSortBy "title"}}
          @sortedBy={{or (eq @sortBy "title") (eq @sortBy "title:desc")}}
        >
          {{t "general.learnerGroupTitle"}}
        </SortableTh>
        <SortableTh
          class="hide-from-small-screen"
          @align="center"
          @colspan={{1}}
          @sortedAscending={{this.sortedAscending}}
          @sortType="numeric"
          @onClick={{fn this.setSortBy "usersCount"}}
          @sortedBy={{or (eq @sortBy "usersCount") (eq @sortBy "usersCount:desc")}}
        >
          {{t "general.members"}}
        </SortableTh>
        <SortableTh
          class="hide-from-small-screen"
          @align="center"
          @colspan={{1}}
          @sortedAscending={{this.sortedAscending}}
          @sortType="numeric"
          @onClick={{fn this.setSortBy "childrenCount"}}
          @sortedBy={{or (eq @sortBy "childrenCount") (eq @sortBy "childrenCount:desc")}}
        >
          {{t "general.subgroups"}}
        </SortableTh>
        <th class="text-right">
          {{t "general.actions"}}
        </th>
      </tr>
    </thead>
    <tbody>
      {{#each
        (sort-by
          (if (or (eq @sortBy "title") (eq @sortBy "title:desc")) this.sortByTitle @sortBy)
          @learnerGroups
        )
        as |learnerGroup|
      }}
        <LearnerGroup::ListItem
          @learnerGroup={{learnerGroup}}
          @canCopyWithLearners={{@canCopyWithLearners}}
          @copyGroup={{@copyGroup}}
        />
      {{else}}
      {{/each}}
    </tbody>
  </table>
{{/if}}