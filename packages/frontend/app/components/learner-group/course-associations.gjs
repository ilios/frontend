import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { array, fn, uniqueId } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { LinkTo } from '@ember/routing';
import { service } from '@ember/service';
import { TrackedAsyncData } from 'ember-async-data';
import t from 'ember-intl/helpers/t';
import add from 'ember-math-helpers/helpers/add';
import set from 'ember-set-helper/helpers/set';
import eq from 'ember-truth-helpers/helpers/eq';
import or from 'ember-truth-helpers/helpers/or';
import FaIcon from 'ilios-common/components/fa-icon';
import SortableTh from 'ilios-common/components/sortable-th';
import sortBy from 'ilios-common/helpers/sort-by';
import { mapBy, uniqueValues } from 'ilios-common/utils/array-helpers';

export default class LearnerGroupCourseAssociationsComponent extends Component {
  @service iliosConfig;
  @service intl;
  @tracked sortBy = 'school';
  @tracked isExpanded = false;

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
    return new TrackedAsyncData(this.getAssociations(this.args.learnerGroup));
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

  async getAssociations(learnerGroup) {
    // get sessions from the offerings and ILMs associated with the given learner group.
    const offerings = await learnerGroup.offerings;
    const ilms = await learnerGroup.ilmSessions;
    const arr = [...offerings, ...ilms];
    const sessions = await Promise.all(mapBy(arr, 'session'));
    const uniqueSessions = uniqueValues(sessions);

    // add owning courses and school to their sessions
    const sessionsWithCourseAndSchool = await Promise.all(
      uniqueSessions.map(async (session) => {
        const course = await session.course;
        const school = await course.school;
        return { session, course, school };
      }),
    );
    // group these sessions by their owning courses
    const map = new Map();
    sessionsWithCourseAndSchool.forEach(({ session, course, school }) => {
      if (!map.has(course.id)) {
        map.set(course.id, {
          course,
          school,
          sessions: [],
        });
      }
      map.get(course.id).sessions.push(session);
    });
    // convert map into an array.
    const rhett = [...map.values()];

    // sort sessions by title in each data object, then return the list of objects.
    const locale = this.intl.get('primaryLocale');
    return rhett.map((obj) => {
      obj.sessions.sort((a, b) => {
        return a.title.localeCompare(b.title, locale);
      });
      return obj;
    });
  }

  <template>
    {{#let (uniqueId) as |templateId|}}
      <section
        class="learner-group-course-associations"
        data-test-learner-group-course-associations
      >
        {{#if this.isLoaded}}
          <div class="header" data-test-header>
            <h3 class="title" data-test-title>
              {{#if this.hasAssociations}}
                {{#if this.isExpanded}}
                  <button
                    class="title link-button"
                    type="button"
                    aria-expanded="true"
                    aria-controls="content-{{templateId}}"
                    aria-label={{t "general.hideAssociatedCourses"}}
                    data-test-toggle
                    {{on "click" (set this "isExpanded" false)}}
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
                    {{on "click" (set this "isExpanded" true)}}
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
            </h3>
          </div>
          {{#if this.hasAssociations}}
            <div
              id="content-{{templateId}}"
              class="content {{if this.isExpanded '' 'hidden'}}"
              data-test-content
              hidden={{this.isExpanded}}
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
                      colspan="3"
                      @sortedAscending={{this.sortedAscending}}
                      @onClick={{fn this.setSortBy "course"}}
                      @sortedBy={{or (eq this.sortBy "course") (eq this.sortBy "course:desc")}}
                    >
                      {{t "general.course"}}
                    </SortableTh>
                    <th colspan="3">{{t "general.sessions"}}</th>
                  </tr>
                </thead>
                <tbody>
                  {{#each (sortBy this.sortAssociations this.associations) as |association|}}
                    <tr>
                      <td>{{association.school.title}}</td>
                      <td colspan="3">
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
                      <td colspan="3">
                        <ul class="sessions-list">
                          {{#each association.sessions as |session|}}
                            <li data-test-session>
                              <LinkTo @route="session" @models={{array session.course session}}>
                                {{session.title}}
                              </LinkTo>
                            </li>
                          {{/each}}
                        </ul>
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
