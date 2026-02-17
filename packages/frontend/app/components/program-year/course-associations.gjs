import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { fn, uniqueId } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { LinkTo } from '@ember/routing';
import { service } from '@ember/service';
import { TrackedAsyncData } from 'ember-async-data';
import t from 'ember-intl/helpers/t';
import eq from 'ember-truth-helpers/helpers/eq';
import or from 'ember-truth-helpers/helpers/or';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import SortableTh from 'ilios-common/components/sortable-th';
import sortBy from 'ilios-common/helpers/sort-by';
import { faCaretDown, faCaretRight } from '@fortawesome/free-solid-svg-icons';

export default class ProgramYearCourseAssociationsComponent extends Component {
  @service iliosConfig;
  @service intl;
  @tracked sortBy = 'title';

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

  @cached
  get associationsData() {
    return new TrackedAsyncData(
      this.getAssociations(this.args.programYear, this.academicYearCrossesCalendarYearBoundaries),
    );
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

  async getAssociations(programYear, academicYearCrossesBoundaries) {
    const cohort = await programYear.cohort;
    const courses = await cohort.courses;
    return Promise.all(
      courses.map(async (course) => {
        const school = await course.school;
        let title = `${school.title} | ${course.title}`;
        if (academicYearCrossesBoundaries) {
          title += ` (${course.year} - ${course.year + 1})`;
        } else {
          title += ` (${course.year})`;
        }
        return {
          course,
          school,
          title,
        };
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
                    data-test-toggle
                    {{on "click" (fn @setIsExpanded false)}}
                  >
                    {{t "general.associatedCourses"}}
                    ({{this.associations.length}})
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
                    {{t "general.associatedCourses"}}
                    ({{this.associations.length}})
                    <FaIcon @icon={{faCaretRight}} />
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
              <table
                class="ilios-table ilios-table-colors ilios-zebra-table"
                data-test-associations
              >
                <thead class="locked">
                  <tr>
                    <SortableTh
                      @sortedAscending={{this.sortedAscending}}
                      @onClick={{fn this.setSortBy "title"}}
                      @sortedBy={{or (eq this.sortBy "title") (eq this.sortBy "title:desc")}}
                    >
                      {{t "general.course"}}
                    </SortableTh>
                  </tr>
                </thead>
                <tbody>
                  {{#each (sortBy this.sortBy this.associations) as |association|}}
                    <tr>
                      <td>
                        <LinkTo @route="course" @model={{association.course}}>
                          {{association.title}}
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
