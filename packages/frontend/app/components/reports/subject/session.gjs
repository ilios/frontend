import Component from '@glimmer/component';
import { filterBy, mapBy, sortBy } from 'ilios-common/utils/array-helpers';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import { service } from '@ember/service';
import { pluralize } from 'ember-inflector';
import { camelize } from '@ember/string';
import { action } from '@ember/object';
import striptags from 'striptags';
import SubjectHeader from 'frontend/components/reports/subject-header';
import and from 'ember-truth-helpers/helpers/and';
import notEq from 'ember-truth-helpers/helpers/not-eq';
import add from 'ember-math-helpers/helpers/add';
import { LinkTo } from '@ember/routing';
import { array } from '@ember/helper';
import t from 'ember-intl/helpers/t';
import SubjectDownload from 'frontend/components/reports/subject-download';
import LoadingSpinner from 'ilios-common/components/loading-spinner';

export default class ReportsSubjectSessionComponent extends Component {
  @service graphql;
  @service iliosConfig;
  @service currentUser;
  @service intl;

  resultsLengthMax = 200;

  crossesBoundaryConfig = new TrackedAsyncData(
    this.iliosConfig.itemFromConfig('academicYearCrossesCalendarYearBoundaries'),
  );

  @cached
  get allSessionsData() {
    return new TrackedAsyncData(
      this.getReportResults(
        this.args.subject,
        this.args.prepositionalObject,
        this.args.prepositionalObjectTableRowId,
        this.args.school,
      ),
    );
  }

  get allSessions() {
    return this.allSessionsData.isResolved ? this.allSessionsData.value : [];
  }

  @cached
  get academicYearCrossesCalendarYearBoundaries() {
    return this.crossesBoundaryConfig.isResolved ? this.crossesBoundaryConfig.value : false;
  }

  get canViewCourse() {
    return this.currentUser.performsNonLearnerFunction;
  }

  get showYear() {
    return !this.args.year && this.args.prepositionalObject !== 'course';
  }

  get filteredSessions() {
    if (this.args.year) {
      return filterBy(this.allSessions, 'year', Number(this.args.year));
    }

    return this.allSessions;
  }

  get sortedSessions() {
    return sortBy(this.filteredSessions, ['year', 'courseTitle', 'title']);
  }

  get limitedSessions() {
    return this.sortedSessions.slice(0, this.resultsLengthMax);
  }

  async getGraphQLFilters(prepositionalObject, prepositionalObjectTableRowId, school) {
    const rhett = [];
    if (school) {
      rhett.push(`schools: [${school.id}]`);
    }
    if (prepositionalObject && prepositionalObjectTableRowId) {
      let what = pluralize(camelize(prepositionalObject));
      if (prepositionalObject === 'mesh term') {
        what = 'meshDescriptors';
        prepositionalObjectTableRowId = `"${prepositionalObjectTableRowId}"`;
      }
      rhett.push(`${what}: [${prepositionalObjectTableRowId}]`);
    }

    return rhett;
  }

  async getReportResults(subject, prepositionalObject, prepositionalObjectTableRowId, school) {
    if (subject !== 'session') {
      throw new Error(`Report for ${subject} sent to ReportsSubjectSessionComponent`);
    }

    const filters = await this.getGraphQLFilters(
      prepositionalObject,
      prepositionalObjectTableRowId,
      school,
    );
    const result = await this.graphql.find(
      'sessions',
      filters,
      'id, title, course { id, year, title }',
    );
    return result.data.sessions.map(({ id, title, course }) => {
      return { id, title, year: course.year, courseId: course.id, courseTitle: course.title };
    });
  }

  get reportResultsExceedMax() {
    return this.filteredSessions.length > this.resultsLengthMax;
  }

  get resultsLengthDisplay() {
    if (this.args.year) {
      return `${this.filteredSessions.length}/${this.allSessions.length}`;
    }

    return this.allSessions.length;
  }

  @action
  async fetchDownloadData() {
    const filters = await this.getGraphQLFilters(
      this.args.prepositionalObject,
      this.args.prepositionalObjectTableRowId,
      this.args.school,
    );
    const attributes = [
      'id',
      'title',
      'description',
      'sessionObjectives { title }',
      'course { title, year }',
    ];
    const result = await this.graphql.find('sessions', filters, attributes.join(','));
    const sortedResults = sortBy(result.data.sessions, 'title');
    const mappedResults = sortedResults.map(({ title, course, sessionObjectives, description }) => {
      return [
        title,
        course.title,
        this.academicYearCrossesCalendarYearBoundaries
          ? `${course.year} - ${course.year + 1}`
          : `${course.year}`,
        striptags(description),
        striptags(mapBy(sessionObjectives, 'title').join()),
      ];
    });

    return [
      [
        this.intl.t('general.session'),
        this.intl.t('general.course'),
        this.intl.t('general.academicYear'),
        this.intl.t('general.description'),
        this.intl.t('general.objectives'),
      ],
      ...mappedResults,
    ];
  }
  <template>
    <SubjectHeader
      @report={{@report}}
      @school={{@school}}
      @subject={{@subject}}
      @prepositionalObject={{@prepositionalObject}}
      @prepositionalObjectTableRowId={{@prepositionalObjectTableRowId}}
      @year={{@year}}
      @changeYear={{@changeYear}}
      @showYearFilter={{and
        (notEq @prepositionalObject "course")
        (notEq @prepositionalObject "academic year")
      }}
      @description={{@description}}
      @fetchDownloadData={{this.fetchDownloadData}}
      @readyToDownload={{true}}
      @resultsLength={{this.resultsLengthDisplay}}
    />
    <div data-test-reports-subject-session>
      {{#if this.allSessionsData.isResolved}}
        <ul class="report-results{{if this.reportResultsExceedMax ' limited'}}" data-test-results>
          {{#each this.limitedSessions as |obj|}}
            <li>
              {{#if this.showYear}}
                <span data-test-year>
                  {{#if this.academicYearCrossesCalendarYearBoundaries}}
                    {{obj.year}}
                    -
                    {{add obj.year 1}}
                  {{else}}
                    {{obj.year}}
                  {{/if}}
                </span>
              {{/if}}
              <span data-test-course-title>
                {{#if this.canViewCourse}}
                  <LinkTo @route="course" @model={{obj.courseId}}>
                    {{obj.courseTitle}}:
                  </LinkTo>
                {{else}}
                  {{obj.courseTitle}}:
                {{/if}}
              </span>

              <span data-test-session-title>
                {{#if this.canViewCourse}}
                  <LinkTo @route="session" @models={{array obj.courseId obj.id}}>
                    {{obj.title}}
                  </LinkTo>
                {{else}}
                  {{obj.title}}
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
