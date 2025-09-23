import Component from '@glimmer/component';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import { service } from '@ember/service';
import { pluralize } from 'ember-inflector';
import { camelize } from '@ember/string';
import { action } from '@ember/object';
import SubjectHeader from 'frontend/components/reports/subject-header';
import t from 'ember-intl/helpers/t';
import SubjectDownload from 'frontend/components/reports/subject-download';
import LoadingSpinner from 'ilios-common/components/loading-spinner';

export default class ReportsSubjectMeshTermComponent extends Component {
  @service graphql;
  @service intl;

  resultsLengthMax = 200;

  @cached
  get allMeshTermsData() {
    return new TrackedAsyncData(
      this.getReportResults(
        this.args.subject,
        this.args.prepositionalObject,
        this.args.prepositionalObjectTableRowId,
        this.args.school,
      ),
    );
  }

  get allMeshTerms() {
    return this.allMeshTermsData.isResolved ? this.allMeshTermsData.value : [];
  }

  get sortedMeshTerms() {
    return this.allMeshTerms.sort((a, b) => {
      return a.localeCompare(b, this.intl.primaryLocale);
    });
  }

  get limitedMeshTerms() {
    return this.sortedMeshTerms.slice(0, this.resultsLengthMax);
  }

  async getReportResults(subject, prepositionalObject, prepositionalObjectTableRowId, school) {
    if (subject !== 'mesh term') {
      throw new Error(`Report for ${subject} sent to ReportsSubjectMeshTermComponent`);
    }

    let filters = [];
    if (school) {
      filters.push(`schools: [${school.id}]`);
    }
    if (prepositionalObject && prepositionalObjectTableRowId) {
      if (prepositionalObject === 'course') {
        const ids = await this.getMeshIdsForCourse(prepositionalObjectTableRowId);
        filters = [`ids: [${ids.join(', ')}]`]; //drop school filter, a course is only in one school
      } else if (prepositionalObject === 'session') {
        const ids = await this.getMeshIdsForSession(prepositionalObjectTableRowId);
        filters = [`ids: [${ids.join(', ')}]`]; //drop school filter, a session is only in one school
      } else {
        const what = pluralize(camelize(prepositionalObject));
        filters.push(`${what}: [${prepositionalObjectTableRowId}]`);
      }
    }
    const attributes = ['name'];
    const result = await this.graphql.find('meshDescriptors', filters, attributes.join(', '));
    return result.data.meshDescriptors.map(({ name }) => name);
  }

  async getMeshIdsForSession(sessionId) {
    const attributes = [
      'meshDescriptors { id }',
      'sessionObjectives { meshDescriptors { id } }',
      'learningMaterials { meshDescriptors { id } }',
    ];
    const results = await this.graphql.find(
      'sessions',
      [`id: ${sessionId}`],
      attributes.join(', '),
    );
    const session = results.data.sessions[0];
    const ids = [
      ...session.meshDescriptors.map(({ id }) => id),
      ...session.sessionObjectives
        .map(({ meshDescriptors }) => meshDescriptors.map(({ id }) => id))
        .flat(),
      ...session.learningMaterials
        .map(({ meshDescriptors }) => meshDescriptors.map(({ id }) => id))
        .flat(),
    ];
    return [...new Set(ids)].sort().map((id) => `"${id}"`);
  }

  async getMeshIdsForCourse(courseId) {
    const attributes = [
      'meshDescriptors { id }',
      'learningMaterials { meshDescriptors { id } }',
      'courseObjectives { meshDescriptors { id } }',
      'sessions { meshDescriptors { id }, sessionObjectives { meshDescriptors { id } }, learningMaterials { meshDescriptors { id } }}',
    ];
    const results = await this.graphql.find('courses', [`id: ${courseId}`], attributes.join(', '));
    const course = results.data.courses[0];
    const sessionMeshDescriptors = course.sessions.reduce((acc, session) => {
      return [
        ...acc,
        ...session.meshDescriptors.map(({ id }) => id),
        ...session.sessionObjectives
          .map(({ meshDescriptors }) => meshDescriptors.map(({ id }) => id))
          .flat(),
        ...session.learningMaterials
          .map(({ meshDescriptors }) => meshDescriptors.map(({ id }) => id))
          .flat(),
      ];
    }, []);
    const ids = [
      ...course.meshDescriptors.map(({ id }) => id),
      ...course.courseObjectives
        .map(({ meshDescriptors }) => meshDescriptors.map(({ id }) => id))
        .flat(),
      ...course.learningMaterials
        .map(({ meshDescriptors }) => meshDescriptors.map(({ id }) => id))
        .flat(),
      ...sessionMeshDescriptors,
    ];
    return [...new Set(ids)].sort().map((id) => `"${id}"`);
  }

  get reportResultsExceedMax() {
    return this.allMeshTerms.length > this.resultsLengthMax;
  }

  @action
  async fetchDownloadData() {
    return [[this.intl.t('general.meshTerms')], ...this.sortedMeshTerms.map((v) => [v])];
  }
  <template>
    <SubjectHeader
      @report={{@report}}
      @school={{@school}}
      @subject={{@subject}}
      @prepositionalObject={{@prepositionalObject}}
      @prepositionalObjectTableRowId={{@prepositionalObjectTableRowId}}
      @year={{@year}}
      @showYearFilter={{false}}
      @description={{@description}}
      @fetchDownloadData={{this.fetchDownloadData}}
      @readyToDownload={{this.allMeshTermsData.isResolved}}
      @resultsLength={{this.allMeshTerms.length}}
    />
    <div data-test-reports-subject-mesh-term>
      {{#if this.allMeshTermsData.isResolved}}
        <ul class="report-results{{if this.reportResultsExceedMax ' limited'}}" data-test-results>
          {{#each this.limitedMeshTerms as |name|}}
            <li>
              {{name}}
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
