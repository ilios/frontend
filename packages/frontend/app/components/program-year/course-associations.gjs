import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { fn, uniqueId } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { LinkTo } from '@ember/routing';
import { service } from '@ember/service';
import { TrackedAsyncData } from 'ember-async-data';
import t from 'ember-intl/helpers/t';
import add from 'ember-math-helpers/helpers/add';
import eq from 'ember-truth-helpers/helpers/eq';
import or from 'ember-truth-helpers/helpers/or';
import FaIcon from 'ilios-common/components/fa-icon';
import SortableTh from 'ilios-common/components/sortable-th';
import sortBy from 'ilios-common/helpers/sort-by';

export default class ProgramYearCourseAssociationsComponent extends Component {
  @service iliosConfig;
  @service intl;
  @tracked sortBy = 'school';

  crossesBoundaryConfig = new TrackedAsyncData(
    this.iliosConfig.itemFromConfig('academicYearCrossesCalendarYearBoundaries'),
  );

  @cached
  get academicYearCrossesCalendarYearBoundaries() {
    return this.crossesBoundaryConfig.isResolved ? this.crossesBoundaryConfig.value : false;
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

  @action
  sortAssociations(a, b) {
    const locale = this.intl.get('primaryLocale');
    switch (this.sortBy) {
      case 'school':
        return a.school.title.localeCompare(b.school.title, locale);
      case 'school:desc':
        return b.school.title.localeCompare(a.school.title, locale);
      case 'course':
        return a.course.title.localeCompare(b.course.title, locale);
      case 'course:desc':
        return b.course.title.localeCompare(a.course.title, locale);
    }
    return 0;
  }

  @cached
  get associationsData() {
    return new TrackedAsyncData(this.getAssociations(this.args.programYear));
  }

  get associations() {
    return this.associationsData.isResolved ? this.associationsData.value : [];
  }

  get hasAssociations() {
    return !!this.associations.length;
  }

  get isLoaded() {
    return this.associationsData.isResolved;
  }

  async getAssociations(programYear) {
    const cohort = await programYear.cohort;
    const courses = await cohort.courses;
    return Promise.all(
      courses.map(async (course) => {
        const school = await course.school;
        return { course, school };
      }),
    );
  }

  <template>
    {{#let (uniqueId) as |templateId|}}
      <section class="program-year-course-associations" data-test-program-year-course-associations>
        {{#if this.isLoaded}}
          <div class="header" data-test-header>
            <h2 class="title" data-test-title>
              {{#if this.hasAssociations}}
                {{#if @isExpanded}}
                  <button
                    class="title link-button"
                    type="button"
                    aria-expanded="true"
                    aria-controls="content-{{templateId}}"
                    aria-label={{t "general.hideAssociatedCourses"}}
                    data-test-toggle
                    {{on "click" (fn @setIsExpanded false)}}
                  >
                    {{t "general.associatedCourses"}}
                    ({{this.associations.length}})
                    <FaIcon @icon="caret-down" />
                  </button>
                {{else}}
                  <button
                    class="title link-button"
                    type="button"
                    aria-expanded="false"
                    aria-controls="content-{{templateId}}"
                    aria-label={{t "general.showAssociatedCourses"}}
                    data-test-toggle
                    {{on "click" (fn @setIsExpanded true)}}
                  >
                    {{t "general.associatedCourses"}}
                    ({{this.associations.length}})
                    <FaIcon @icon="caret-right" />
                  </button>
                {{/if}}
              {{else}}
                {{t "general.associatedCourses"}}
                ({{this.associations.length}})
              {{/if}}
            </h2>
          </div>
          {{#if this.hasAssociations}}
            <div
              id="content-{{templateId}}"
              class="content{{if @isExpanded '' ' hidden'}}"
              data-test-content
              hidden={{@isExpanded}}
            >
              <table data-test-associations>
                <thead>
                  <tr>
                    <SortableTh
                      @sortedAscending={{this.sortedAscending}}
                      @onClick={{fn this.setSortBy "school"}}
                      @sortedBy={{or (eq this.sortBy "school") (eq this.sortBy "school:desc")}}
                    >
                      {{t "general.school"}}
                    </SortableTh>
                    <SortableTh
                      colspan="6"
                      @sortedAscending={{this.sortedAscending}}
                      @onClick={{fn this.setSortBy "course"}}
                      @sortedBy={{or (eq this.sortBy "course") (eq this.sortBy "course:desc")}}
                    >
                      {{t "general.course"}}
                    </SortableTh>
                  </tr>
                </thead>
                <tbody>
                  {{#each (sortBy this.sortAssociations this.associations) as |association|}}
                    <tr>
                      <td>{{association.school.title}}</td>
                      <td colspan="6">
                        <LinkTo @route="course" @model={{association.course}}>
                          {{association.course.title}}
                          {{#if this.academicYearCrossesCalendarYearBoundaries}}
                            ({{association.course.year}}
                            -
                            {{add association.course.year 1}})
                          {{else}}
                            ({{association.course.year}})
                          {{/if}}
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
