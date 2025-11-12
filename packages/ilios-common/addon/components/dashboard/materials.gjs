import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { isPresent } from '@ember/utils';
import { task, timeout } from 'ember-concurrency';
import { TrackedAsyncData } from 'ember-async-data';
import { DateTime } from 'luxon';
import { filterBy, sortBy, uniqueById } from 'ilios-common/utils/array-helpers';
import t from 'ember-intl/helpers/t';
import ToggleButtons from 'ilios-common/components/toggle-buttons';
import not from 'ember-truth-helpers/helpers/not';
import { on } from '@ember/modifier';
import isEqual from 'ember-truth-helpers/helpers/is-equal';
import add from 'ember-math-helpers/helpers/add';
import perform from 'ember-concurrency/helpers/perform';
import PagedlistControls from 'ilios-common/components/pagedlist-controls';
import SortableTh from 'ilios-common/components/sortable-th';
import or from 'ember-truth-helpers/helpers/or';
import eq from 'ember-truth-helpers/helpers/eq';
import { fn } from '@ember/helper';
import MaterialListItem from 'ilios-common/components/dashboard/material-list-item';
import FaIcon from 'ilios-common/components/fa-icon';

const DEBOUNCE_DELAY = 250;

export default class DashboardMaterialsComponent extends Component {
  daysInAdvance = 60;
  @service store;
  @service fetch;
  @service iliosConfig;
  @tracked showAllMaterials = false;
  @service currentUser;

  @cached
  get courseData() {
    return new TrackedAsyncData(this.loadCourse(this.args.courseIdFilter));
  }

  get course() {
    return this.courseData.isResolved ? this.courseData.value : null;
  }

  get courseLoaded() {
    return this.courseData.isResolved;
  }

  @cached
  get materialsData() {
    return new TrackedAsyncData(this.loadMaterials(this.args.showAllMaterials));
  }

  get materials() {
    return this.materialsData.isResolved ? this.materialsData.value : [];
  }

  get materialsLoaded() {
    return this.materialsData.isResolved;
  }

  crossesBoundaryConfig = new TrackedAsyncData(
    this.iliosConfig.itemFromConfig('academicYearCrossesCalendarYearBoundaries'),
  );

  @cached
  get academicYearCrossesCalendarYearBoundaries() {
    return this.crossesBoundaryConfig.isResolved ? this.crossesBoundaryConfig.value : null;
  }

  async loadMaterials() {
    const user = await this.currentUser.getModel();
    let url = `${this.iliosConfig.apiNameSpace}/usermaterials/${user.id}`;
    if (!this.args.showAllMaterials) {
      const now = DateTime.now();
      const from = now.set({ hour: 0, minute: 0 }).toUnixInteger();
      const to = now
        .set({ hour: 23, minute: 59 })
        .plus({ day: this.daysInAdvance })
        .toUnixInteger();
      url += `?before=${to}&after=${from}`;
    }
    const data = await this.fetch.getJsonFromApiHost(url);
    return data.userMaterials;
  }

  async loadCourse(courseId) {
    let course = null;
    try {
      course = await this.store.findRecord('course', courseId);
    } catch {
      // eat the exception
    }
    return course;
  }

  get canApplyCourseFilter() {
    if (isPresent(this.args.courseIdFilter)) {
      return this.materialsFilteredByCourse.length;
    }
    return true;
  }

  get materialsFilteredByCourse() {
    if (isPresent(this.args.courseIdFilter)) {
      return filterBy(this.materials, 'course', this.args.courseIdFilter);
    }
    return this.materials;
  }

  get allFilteredMaterials() {
    let materials = this.materialsFilteredByCourse;

    if (isPresent(this.args.filter)) {
      materials = materials.filter(({ courseTitle, instructors, sessionTitle, title }) => {
        let searchString = `${title} ${courseTitle} ${sessionTitle} `;

        if (isPresent(instructors)) {
          searchString += instructors.join(' ');
        }

        return searchString.toLowerCase().includes(this.args.filter.toLowerCase());
      });
    }

    const sortedMaterials = sortBy(materials, this.sortInfo.column);
    if (this.sortInfo.descending) {
      return sortedMaterials.reverse();
    }
    return sortedMaterials;
  }

  get sortInfo() {
    const parts = this.args.sortBy.split(':');
    const column = parts[0];
    const descending = parts.length > 1 && parts[1] === 'desc';

    return { column, descending, sortBy: this.args.sortBy };
  }

  get filteredMaterials() {
    if (this.args.limit >= this.total) {
      return this.allFilteredMaterials;
    }
    return this.allFilteredMaterials.slice(this.args.offset, this.args.offset + this.args.limit);
  }

  get total() {
    return this.allFilteredMaterials.length;
  }

  get courses() {
    if (!this.materials) {
      return [];
    }
    const arr = this.materials.map((material) => {
      return {
        id: material.course,
        title: material.courseTitle,
        externalId: material.courseExternalId,
        year: material.courseYear,
      };
    });

    return sortBy(uniqueById(arr), ['year', 'title']);
  }

  get sortedAscending() {
    return this.args.sortBy.search(/desc/) === -1;
  }

  @action
  sortBy(what) {
    if (this.args.sortBy === what) {
      what += ':desc';
    }
    this.args.setSortBy(what);
  }

  @action
  changeCourseIdFilter(event) {
    this.args.setOffset(0);
    this.args.setCourseIdFilter(event.target.value);
  }

  setQuery = task({ restartable: true }, async (query) => {
    await timeout(DEBOUNCE_DELAY);
    this.args.setOffset(0);
    this.args.setFilter(query);
  });
  <template>
    <div class="dashboard-materials main-section" data-test-dashboard-materials>
      <h2 class="title" data-test-materials-title>
        {{t "general.myMaterials"}}
      </h2>
      <div class="dashboard-materials-content">
        {{#if this.materialsLoaded}}
          {{#if this.materials.length}}
            <div class="header" data-test-materials-header>
              <ToggleButtons
                @firstOptionSelected={{not @showAllMaterials}}
                @firstLabel={{t "general.nextXDays" days=this.daysInAdvance}}
                @secondLabel={{t "general.allMaterials"}}
                @toggle={{@toggleMaterialsMode}}
              />
            </div>
            <div class="material-list" data-test-materials-list>
              <span class="course-filter" data-test-course-filter>
                <select
                  aria-label={{t "general.selectCourse"}}
                  {{on "change" this.changeCourseIdFilter}}
                >
                  <option value>
                    {{t "general.allCourses"}}
                  </option>
                  {{#each this.courses as |courseObj|}}
                    <option
                      selected={{isEqual courseObj.id @courseIdFilter}}
                      value={{courseObj.id}}
                    >
                      {{#if this.academicYearCrossesCalendarYearBoundaries}}
                        {{courseObj.year}}
                        -
                        {{add courseObj.year 1}}
                        |
                      {{else}}
                        {{courseObj.year}}
                        |
                      {{/if}}
                      {{#if courseObj.externalId}}
                        [{{courseObj.externalId}}] |
                        {{courseObj.title}}
                      {{else}}
                        {{courseObj.title}}
                      {{/if}}
                    </option>
                  {{/each}}
                  {{#unless this.canApplyCourseFilter}}
                    {{#if this.courseLoaded}}
                      {{#if this.course}}
                        <option selected="selected" disabled>
                          {{#if this.academicYearCrossesCalendarYearBoundaries}}
                            {{this.course.year}}
                            -
                            {{add this.course.year 1}}
                            |
                          {{else}}
                            {{this.course.year}}
                            |
                          {{/if}}
                          {{#if this.course.externalId}}
                            [{{this.course.externalId}}] |
                            {{this.course.title}}
                          {{else}}
                            {{this.course.title}}
                          {{/if}}
                        </option>
                      {{else}}
                        <option selected="selected" disabled>&ast;&ast;
                          {{t "general.courseNotFound"}}
                          &ast;&ast;</option>
                      {{/if}}
                    {{/if}}
                  {{/unless}}
                </select>
              </span>
              <span class="filter" data-test-text-filter>
                <input
                  aria-label={{t "general.filterPlaceholder"}}
                  data-test-filter-input
                  placeholder={{t "general.filterPlaceholder"}}
                  type="text"
                  value={{@filter}}
                  {{on "input" (perform this.setQuery value="target.value")}}
                />
              </span>
              <nav
                class="paginator"
                aria-label={{t "general.topPagination"}}
                data-test-paginator-top
              >
                <PagedlistControls
                  @offset={{@offset}}
                  @limit={{@limit}}
                  @total={{this.total}}
                  @setOffset={{@setOffset}}
                  @setLimit={{@setLimit}}
                />
              </nav>
              <table class="ilios-zebra-table">
                <thead>
                  <tr>
                    <th colspan="2">{{t "general.status"}}</th>
                    <SortableTh
                      @colspan={{6}}
                      @sortedAscending={{this.sortedAscending}}
                      @sortedBy={{or (eq @sortBy "title") (eq @sortBy "title:desc")}}
                      @onClick={{fn this.sortBy "title"}}
                    >
                      {{t "general.title"}}
                    </SortableTh>
                    <SortableTh
                      class="hide-from-small-screen"
                      @colspan={{6}}
                      @sortedAscending={{this.sortedAscending}}
                      @sortedBy={{or (eq @sortBy "sessionTitle") (eq @sortBy "sessionTitle:desc")}}
                      @onClick={{fn this.sortBy "sessionTitle"}}
                    >
                      {{t "general.session"}}
                    </SortableTh>
                    <SortableTh
                      class="hide-from-small-screen"
                      @colspan={{6}}
                      @sortedAscending={{this.sortedAscending}}
                      @sortedBy={{or (eq @sortBy "courseTitle") (eq @sortBy "courseTitle:desc")}}
                      @onClick={{fn this.sortBy "courseTitle"}}
                    >
                      {{t "general.course"}}
                    </SortableTh>
                    <SortableTh
                      class="hide-from-large-screen"
                      @colspan={{6}}
                      @sortedAscending={{this.sortedAscending}}
                      @sortedBy={{or (eq @sortBy "courseTitle") (eq @sortBy "courseTitle:desc")}}
                      @onClick={{fn this.sortBy "courseTitle"}}
                    >
                      {{t "general.course"}}
                      ::
                      {{t "general.session"}}
                    </SortableTh>
                    <th colspan="3" class="hide-from-small-screen">
                      {{t "general.instructor"}}
                    </th>
                    <SortableTh
                      @colspan={{4}}
                      @sortedAscending={{this.sortedAscending}}
                      @sortedBy={{or
                        (eq @sortBy "firstOfferingDate")
                        (eq @sortBy "firstOfferingDate:desc")
                      }}
                      @sortType="numeric"
                      @onClick={{fn this.sortBy "firstOfferingDate"}}
                    >
                      {{t "general.date"}}
                    </SortableTh>
                  </tr>
                </thead>
                <tbody>
                  {{#each this.filteredMaterials as |lmObject|}}
                    <MaterialListItem @lm={{lmObject}} />
                  {{else}}
                    <tr>
                      <td colspan="18" class="no-results" data-test-none>
                        {{t "general.none"}}
                      </td>
                    </tr>
                  {{/each}}
                </tbody>
              </table>
              <nav
                class="paginator"
                aria-label={{t "general.bottomPagination"}}
                data-test-paginator-bottom
              >
                <PagedlistControls
                  @offset={{@offset}}
                  @limit={{@limit}}
                  @total={{this.total}}
                  @setOffset={{@setOffset}}
                  @setLimit={{@setLimit}}
                />
              </nav>
            </div>
          {{else}}
            <p>{{t "general.none"}}</p>
          {{/if}}
        {{else}}
          <FaIcon @icon="spinner" class="orange" @size="2x" @spin={{true}} />
        {{/if}}
      </div>
    </div>
  </template>
}
