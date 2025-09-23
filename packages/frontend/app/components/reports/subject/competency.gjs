import Component from '@glimmer/component';
import { sortBy } from 'ilios-common/utils/array-helpers';
import { service } from '@ember/service';
import { pluralize } from 'ember-inflector';
import { camelize } from '@ember/string';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import { action } from '@ember/object';
import SubjectHeader from 'frontend/components/reports/subject-header';
import t from 'ember-intl/helpers/t';
import SubjectDownload from 'frontend/components/reports/subject-download';
import LoadingSpinner from 'ilios-common/components/loading-spinner';

export default class ReportsSubjectCompetencyComponent extends Component {
  @service graphql;
  @service intl;

  resultsLengthMax = 200;

  @cached
  get allCompetenciesData() {
    return new TrackedAsyncData(
      this.getReportResults(
        this.args.subject,
        this.args.prepositionalObject,
        this.args.prepositionalObjectTableRowId,
        this.args.school,
      ),
    );
  }

  get allCompetencies() {
    return this.allCompetenciesData.isResolved ? this.allCompetenciesData.value : [];
  }

  get sortedCompetencies() {
    if (this.showSchool) {
      return sortBy(this.allCompetencies, ['school.title', 'title']);
    }

    return sortBy(this.allCompetencies, ['title']);
  }

  get limitedCompetencies() {
    return this.sortedCompetencies.slice(0, this.resultsLengthMax);
  }

  get showSchool() {
    return !this.args.school;
  }

  async getResultsForSession(sessionId, filters) {
    filters.push(`id: ${sessionId}`);

    const session = await this.graphql.find('sessions', filters, 'course { id }');
    const courseId = session.data.sessions[0].course.id;

    const courseObjectives = (
      await this.graphql.find(
        'courseObjectives',
        [`course: ${courseId}`],
        `programYearObjectives { competency { id, title, school { title } }}`,
      )
    ).data.courseObjectives;

    const competencies = courseObjectives.map((o) =>
      o.programYearObjectives.map((pyo) => pyo.competency),
    );

    const filteredCompetencies = [...new Map(competencies.flat().map((c) => [c.id, c])).values()];

    return filteredCompetencies;
  }

  async getReportResults(subject, prepositionalObject, prepositionalObjectTableRowId, school) {
    if (subject !== 'competency') {
      throw new Error(`Report for ${subject} sent to ReportsSubjectCompetencyComponent`);
    }

    let filters = [];
    if (school) {
      filters.push(`schools: [${school.id}]`);
    }

    if (prepositionalObject && prepositionalObjectTableRowId) {
      if (prepositionalObject == 'session') {
        return this.getResultsForSession(prepositionalObjectTableRowId, filters);
      }

      const what = pluralize(camelize(prepositionalObject));
      filters.push(`${what}: [${prepositionalObjectTableRowId}]`);
    }

    const attributes = ['id', 'title', 'school { title }'];
    const result = await this.graphql.find('competencies', filters, attributes.join(', '));
    return result.data.competencies;
  }

  get reportResultsExceedMax() {
    return this.allCompetencies.length > this.resultsLengthMax;
  }

  @action
  async fetchDownloadData() {
    if (this.showSchool) {
      return [
        [this.intl.t('general.school'), this.intl.t('general.competencies')],
        ...this.sortedCompetencies.map(({ school, title }) => [school.title, title]),
      ];
    }
    return [
      [this.intl.t('general.competencies')],
      ...this.sortedCompetencies.map(({ title }) => [title]),
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
      @showYearFilter={{false}}
      @description={{@description}}
      @fetchDownloadData={{this.fetchDownloadData}}
      @readyToDownload={{this.allCompetenciesData.isResolved}}
      @resultsLength={{this.allCompetencies.length}}
    />
    <div data-test-reports-subject-competency>
      {{#if this.allCompetenciesData.isResolved}}
        <ul class="report-results{{if this.reportResultsExceedMax ' limited'}}" data-test-results>
          {{#each this.limitedCompetencies as |competency|}}
            <li>
              {{#if this.showSchool}}
                <span class="school" data-test-school>
                  {{competency.school.title}}:
                </span>
              {{/if}}
              <span data-test-title>
                {{competency.title}}
              </span>
            </li>
          {{else}}
            <li>{{t "general.none"}}</li>
          {{/each}}
        </ul>
        {{#if this.reportResultsExceedMax}}
          <SubjectDownload
            @report={{@report}}
            @school={{@school}}
            @subject={{@subject}}
            @prepositionalObject={{@prepositionalObject}}
            @prepositionalObjectTableRowId={{@prepositionalObjectTableRowId}}
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
