import Component from '@glimmer/component';
import { sortBy } from 'ilios-common/utils/array-helpers';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import { service } from '@ember/service';
import { pluralize } from 'ember-inflector';
import { camelize } from '@ember/string';
import { action } from '@ember/object';
import SubjectHeader from 'frontend/components/reports/subject-header';
import { LinkTo } from '@ember/routing';
import t from 'ember-intl/helpers/t';
import SubjectDownload from 'frontend/components/reports/subject-download';
import LoadingSpinner from 'ilios-common/components/loading-spinner';

export default class ReportsSubjectProgramComponent extends Component {
  @service graphql;
  @service currentUser;
  @service intl;

  resultsLengthMax = 200;

  @cached
  get allProgramsData() {
    return new TrackedAsyncData(
      this.getReportResults(
        this.args.subject,
        this.args.prepositionalObject,
        this.args.prepositionalObjectTableRowId,
        this.args.school,
      ),
    );
  }

  get allPrograms() {
    return this.allProgramsData.isResolved ? this.allProgramsData.value : [];
  }

  get canView() {
    return this.currentUser.performsNonLearnerFunction;
  }

  get showSchool() {
    return !this.args.school;
  }

  get sortedPrograms() {
    return sortBy(this.allPrograms, ['school.title', 'title']);
  }

  get limitedPrograms() {
    return this.sortedPrograms.slice(0, this.resultsLengthMax);
  }

  async getReportResults(subject, prepositionalObject, prepositionalObjectTableRowId, school) {
    if (subject !== 'program') {
      throw new Error(`Report for ${subject} sent to ReportsSubjectProgramComponent`);
    }

    let filters = [];
    if (school) {
      filters.push(`schools: [${school.id}]`);
    }
    if (prepositionalObject && prepositionalObjectTableRowId) {
      const what = pluralize(camelize(prepositionalObject));
      filters.push(`${what}: [${prepositionalObjectTableRowId}]`);
    }
    const attributes = ['id', 'title', 'school { title }'];
    const result = await this.graphql.find('programs', filters, attributes.join(', '));
    return result.data.programs;
  }

  get reportResultsExceedMax() {
    return this.allPrograms.length > this.resultsLengthMax;
  }

  @action
  async fetchDownloadData() {
    if (this.showSchool) {
      return [
        [this.intl.t('general.school'), this.intl.t('general.program')],
        ...this.sortedPrograms.map(({ school, title }) => [school.title, title]),
      ];
    }

    return [[this.intl.t('general.program')], ...this.sortedPrograms.map(({ title }) => [title])];
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
      @readyToDownload={{this.allProgramsData.isResolved}}
      @resultsLength={{this.allPrograms.length}}
    />
    <div data-test-reports-subject-program>
      {{#if this.allProgramsData.isResolved}}
        <ul class="report-results{{if this.reportResultsExceedMax ' limited'}}" data-test-results>
          {{#each this.limitedPrograms as |program|}}
            <li>
              {{#if this.showSchool}}
                <span data-test-school>
                  {{program.school.title}}:
                </span>
              {{/if}}
              <span data-test-title>
                {{#if this.canView}}
                  <LinkTo @route="program" @model={{program.id}}>
                    {{program.title}}
                  </LinkTo>
                {{else}}
                  {{program.title}}
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
