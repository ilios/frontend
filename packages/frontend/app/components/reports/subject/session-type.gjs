import Component from '@glimmer/component';
import { sortBy } from 'ilios-common/utils/array-helpers';
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

export default class ReportsSubjectSessionTypeComponent extends Component {
  @service graphql;
  @service intl;

  resultsLengthMax = 200;

  @cached
  get allSessionTypesData() {
    return new TrackedAsyncData(
      this.getReportResults(
        this.args.subject,
        this.args.prepositionalObject,
        this.args.prepositionalObjectTableRowId,
        this.args.school,
      ),
    );
  }

  get allSessionTypes() {
    return this.allSessionTypesData.isResolved ? this.allSessionTypesData.value : [];
  }

  get sortedSessionTypes() {
    if (this.showSchool) {
      return sortBy(this.allSessionTypes, ['school.title', 'title']);
    }

    return sortBy(this.allSessionTypes, ['title']);
  }

  get limitedSessionTypes() {
    return this.sortedSessionTypes.slice(0, this.resultsLengthMax);
  }

  get showSchool() {
    return !this.args.school;
  }

  async getGraphQLFilters(prepositionalObject, prepositionalObjectTableRowId, school) {
    let rhett = [];
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
    if (subject !== 'session type') {
      throw new Error(`Report for ${subject} sent to ReportsSubjectSessionTypeComponent`);
    }

    const filters = await this.getGraphQLFilters(
      prepositionalObject,
      prepositionalObjectTableRowId,
      school,
    );
    const attributes = ['title', 'school { title }'];
    const result = await this.graphql.find('sessionTypes', filters, attributes.join(', '));
    return result.data.sessionTypes;
  }

  get reportResultsExceedMax() {
    return this.allSessionTypes.length > this.resultsLengthMax;
  }

  @action
  async fetchDownloadData() {
    return [[this.intl.t('general.sessionTypes')], ...this.sortedSessionTypes.map((v) => [v])];
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
      @readyToDownload={{this.allSessionTypesData.isResolved}}
      @resultsLength={{this.allSessionTypes.length}}
    />
    <div data-test-reports-subject-session-type>
      {{#if this.allSessionTypesData.isResolved}}
        <ul class="report-results{{if this.reportResultsExceedMax ' limited'}}" data-test-results>
          {{#each this.limitedSessionTypes as |sessionType|}}
            <li>
              {{#if this.showSchool}}
                <span class="school" data-test-school>
                  {{sessionType.school.title}}:
                </span>
              {{/if}}
              {{sessionType.title}}
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
