import Component from '@glimmer/component';
import { filterBy, sortBy } from 'ilios-common/utils/array-helpers';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import { service } from '@ember/service';
import { pluralize } from 'ember-inflector';
import { camelize } from '@ember/string';
import { action } from '@ember/object';
import SubjectHeader from 'frontend/components/reports/subject-header';
import notEq from 'ember-truth-helpers/helpers/not-eq';
import { LinkTo } from '@ember/routing';
import t from 'ember-intl/helpers/t';
import SubjectDownload from 'frontend/components/reports/subject-download';
import LoadingSpinner from 'ilios-common/components/loading-spinner';

export default class ReportsSubjectCourseComponent extends Component {
  @service graphql;
  @service iliosConfig;
  @service currentUser;
  @service intl;

  resultsLengthMax = 200;

  crossesBoundaryConfig = new TrackedAsyncData(
    this.iliosConfig.itemFromConfig('academicYearCrossesCalendarYearBoundaries'),
  );

  @cached
  get allCoursesData() {
    return new TrackedAsyncData(
      this.getReportResults(
        this.args.subject,
        this.args.prepositionalObject,
        this.args.prepositionalObjectTableRowId,
        this.args.school,
      ),
    );
  }

  get allCourses() {
    return this.allCoursesData.isResolved ? this.allCoursesData.value : [];
  }

  @cached
  get academicYearCrossesCalendarYearBoundaries() {
    return this.crossesBoundaryConfig.isResolved ? this.crossesBoundaryConfig.value : false;
  }

  get canViewCourse() {
    return this.currentUser.performsNonLearnerFunction;
  }

  get showYear() {
    return !this.args.year && this.args.prepositionalObject !== 'academic year';
  }

  get filteredCourses() {
    if (this.args.year) {
      return filterBy(this.allCourses, 'year', Number(this.args.year));
    }

    return this.allCourses;
  }

  get mappedCourses() {
    if (this.academicYearCrossesCalendarYearBoundaries) {
      return this.filteredCourses.map(({ title, year, externalId }) => {
        return {
          title,
          year: `${year} - ${year + 1}`,
          externalId,
        };
      });
    } else {
      return this.filteredCourses;
    }
  }

  get sortedCourses() {
    return sortBy(this.mappedCourses, ['year', 'title']);
  }

  get limitedCourses() {
    return this.sortedCourses.slice(0, this.resultsLengthMax);
  }

  async getGraphQLFilters(prepositionalObject, prepositionalObjectTableRowId, school) {
    let rhett = [];
    if (school) {
      rhett.push(`schools: [${school.id}]`);
    }
    if (prepositionalObject && prepositionalObjectTableRowId) {
      if (prepositionalObject === 'mesh term') {
        const courseIds = await this.getCourseIdsForMeshDescriptor(prepositionalObjectTableRowId);
        rhett.push(`ids: [${courseIds.join(', ')}]`);
      } else {
        const what = pluralize(camelize(prepositionalObject));
        rhett.push(`${what}: [${prepositionalObjectTableRowId}]`);
      }
    }

    return rhett;
  }

  async getCourseIdsForMeshDescriptor(meshDescriptorId) {
    const parts = [
      'courses { id }',
      'courseObjectives { course { id } }',
      'sessions { course { id } }',
      'sessionObjectives { session { course { id } } }',
    ];
    const result = await this.graphql.find(
      'meshDescriptors',
      [`id: "${meshDescriptorId}"`],
      parts.join(', '),
    );
    const { courses, courseObjectives, sessions, sessionObjectives } =
      result.data.meshDescriptors[0];
    const ids = [
      ...courses.map((course) => course.id),
      ...courseObjectives.map((objective) => objective.course.id),
      ...sessions.map((session) => session.course.id),
      ...sessionObjectives.map((objective) => objective.session.course.id),
    ];

    return [...new Set(ids)].sort();
  }

  async getReportResults(subject, prepositionalObject, prepositionalObjectTableRowId, school) {
    const filters = await this.getGraphQLFilters(
      prepositionalObject,
      prepositionalObjectTableRowId,
      school,
    );
    if (subject !== 'course') {
      throw new Error(`Report for ${subject} sent to ReportsSubjectCourseComponent`);
    }
    const result = await this.graphql.find('courses', filters, 'id, title, year, externalId');

    return result.data.courses;
  }

  get reportResultsExceedMax() {
    return this.filteredCourses.length > this.resultsLengthMax;
  }

  get resultsLengthDisplay() {
    if (this.args.year) {
      return `${this.filteredCourses.length}/${this.allCourses.length}`;
    }

    return this.allCourses.length;
  }

  @action
  async fetchDownloadData() {
    return [
      [
        this.intl.t('general.course'),
        this.intl.t('general.academicYear'),
        this.intl.t('general.externalId'),
      ],
      ...this.sortedCourses.map(({ title, year, externalId }) => [title, year, externalId]),
    ];
  }
  <template>
    <SubjectHeader
      @report={{@report}}
      @subject={{@subject}}
      @prepositionalObject={{@prepositionalObject}}
      @prepositionalObjectTableRowId={{@prepositionalObjectTableRowId}}
      @school={{@school}}
      @changeYear={{@changeYear}}
      @year={{@year}}
      @description={{@description}}
      @showYearFilter={{notEq @prepositionalObject "academic year"}}
      @fetchDownloadData={{this.fetchDownloadData}}
      @readyToDownload={{this.allCoursesData.isResolved}}
      @resultsLength={{this.resultsLengthDisplay}}
    />
    <div data-test-reports-subject-course>
      {{#if this.allCoursesData.isResolved}}
        <ul class="report-results{{if this.reportResultsExceedMax ' limited'}}" data-test-results>
          {{#each this.limitedCourses as |course|}}
            <li>
              {{#if this.showYear}}
                <span data-test-year>
                  {{course.year}}
                </span>
              {{/if}}
              <span data-test-title>
                {{#if this.canViewCourse}}
                  <LinkTo @route="course" @model={{course.id}}>
                    {{course.title}}
                    {{#if course.externalId}}
                      ({{course.externalId}})
                    {{/if}}
                  </LinkTo>
                {{else}}
                  {{course.title}}
                  {{#if course.externalId}}
                    ({{course.externalId}})
                  {{/if}}
                {{/if}}
              </span>
            </li>
          {{else}}
            <li>{{t "general.none"}}</li>
          {{/each}}
        </ul>
        {{#if this.reportResultsExceedMax}}
          <SubjectDownload
            @report={{@report}}
            @subject={{@subject}}
            @prepositionalObject={{@prepositionalObject}}
            @prepositionalObjectTableRowId={{@prepositionalObjectTableRowId}}
            @school={{@school}}
            @fetchDownloadData={{this.fetchDownloadData}}
            @readyToDownload={{true}}
            @message={{t "general.reportResultsExceedMax" resultsLengthMax=this.resultsLengthMax}}
          />
        {{/if}}
      {{else}}
        <LoadingSpinner />
      {{/if}}
    </div>
  </template>
}
