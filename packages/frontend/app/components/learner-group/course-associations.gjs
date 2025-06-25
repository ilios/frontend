import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { TrackedAsyncData } from 'ember-async-data';
import t from 'ember-intl/helpers/t';
import { add } from 'ember-math-helpers/helpers/add';
import { mapBy, uniqueValues } from 'ilios-common/utils/array-helpers';

export default class LearnerGroupCourseAssociationsComponent extends Component {
  @service iliosConfig;
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
    if (this.args.sortBy === what) {
      what += ':desc';
    }
    this.args.setSortBy(what);
  }

  @cached
  get associationsData() {
    return new TrackedAsyncData(this.getAssociations(this.args.learnerGroup, this.sortBy));
  }

  get associations() {
    return this.associationsData.isResolved ? this.associationsData.value : [];
  }

  get isLoaded() {
    return this.associations.isResolved();
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
    return [...map.values()];
  }

  <template>
    <div class="learner-group-course-associations" data-learner-group-course-associations>
      <table class="ilios-table">
        <thead>
          <tr>
            <th>{{t "general.school"}}</th>
            <th>{{t "general.course"}}</th>
            <th>{{t "general.sessions"}}</th>
          </tr>
        </thead>
        <tbody>
          {{#each this.associations as |association|}}
            <tr>
              <td>{{association.school.title}}</td>
              <td>
                {{#if this.academicYearCrossesCalendarYearBoundaries}}
                  {{association.course.year}}
                  -
                  {{add association.course.year 1}}
                {{else}}
                  {{association.course.year}}
                {{/if}}
                |
                {{association.course.title}}
              </td>
              <td>
                <ul>
                  {{#each association.sessions as |session|}}
                    <li>{{session.title}}</li>
                  {{/each}}
                </ul>
              </td>
            </tr>
          {{/each}}
        </tbody>
      </table>
    </div>
  </template>
}
