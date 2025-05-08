import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';

export default class InstructorGroupsListComponent extends Component {
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

  get sortedGroups() {
    const sortBy = this.args.sortBy;
    const instructorGroups = this.args.instructorGroups.slice();
    if (sortBy.includes('title')) {
      const locale = this.intl.get('primaryLocale');
      return instructorGroups.sort((a, b) =>
        a.title.localeCompare(b.title, locale, {
          numeric: true,
        }),
      );
    }
    if (sortBy.includes('courses')) {
      return instructorGroups.sort((a, b) => a.courses.length - b.courses.length);
    }

    return instructorGroups.sort((a, b) => a.usersCount - b.usersCount);
  }

  get orderedGroups() {
    return this.sortedAscending ? this.sortedGroups : this.sortedGroups.reverse();
  }
}

{{#if @instructorGroups.length}}
  <table class="instructor-groups-list" data-test-instructor-groups-list ...attributes>
    <thead>
      <tr>
        <SortableTh
          @colspan={{2}}
          @sortedAscending={{this.sortedAscending}}
          @onClick={{fn this.setSortBy "title"}}
          @sortedBy={{or (eq @sortBy "title") (eq @sortBy "title:desc")}}
        >
          {{t "general.instructorGroupTitle"}}
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
          @onClick={{fn this.setSortBy "courses"}}
          @sortedBy={{or (eq @sortBy "courses") (eq @sortBy "courses:desc")}}
        >
          {{t "general.associatedCourses"}}
        </SortableTh>
        <th class="text-right">
          {{t "general.actions"}}
        </th>
      </tr>
    </thead>
    <tbody>
      {{#each this.orderedGroups as |instructorGroup|}}
        <InstructorGroups::ListItem @instructorGroup={{instructorGroup}} />
      {{/each}}
    </tbody>
  </table>
{{/if}}