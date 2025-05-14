import Component from '@glimmer/component';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import { service } from '@ember/service';
import { pluralize } from 'ember-inflector';
import { camelize } from '@ember/string';
import { sortBy } from 'ilios-common/utils/array-helpers';
import { action } from '@ember/object';
import SubjectHeader from 'frontend/components/reports/subject-header';
import t from 'ember-intl/helpers/t';
import SubjectDownload from 'frontend/components/reports/subject-download';
import LoadingSpinner from 'ilios-common/components/loading-spinner';

export default class ReportsSubjectTermComponent extends Component {
  @service graphql;
  @service intl;

  resultsLengthMax = 200;

  @cached
  get allTermsData() {
    return new TrackedAsyncData(
      this.getReportResults(
        this.args.subject,
        this.args.prepositionalObject,
        this.args.prepositionalObjectTableRowId,
        this.args.school,
      ),
    );
  }

  get allTerms() {
    return this.allTermsData.isResolved ? this.allTermsData.value : [];
  }

  get sortedTerms() {
    if (this.showSchool) {
      return sortBy(this.allTerms, ['vocabulary.school.title', 'vocabulary.title', 'title']);
    }

    return sortBy(this.allTerms, ['vocabulary.title', 'title']);
  }

  get limitedTerms() {
    return this.sortedTerms.slice(0, this.resultsLengthMax);
  }

  get showSchool() {
    return !this.args.school;
  }

  async getReportResults(subject, prepositionalObject, prepositionalObjectTableRowId, school) {
    if (subject !== 'term') {
      throw new Error(`Report for ${subject} sent to ReportsSubjectTermComponent`);
    }

    let filters = [];
    if (school) {
      filters.push(`schools: [${school.id}]`);
    }
    if (prepositionalObject && prepositionalObjectTableRowId) {
      const what = pluralize(camelize(prepositionalObject));
      filters.push(`${what}: [${prepositionalObjectTableRowId}]`);
    }
    const attributes = ['id', 'title', 'vocabulary { id, title, school { title} }'];
    const result = await this.graphql.find('terms', filters, attributes.join(', '));
    return result.data.terms;
  }

  get reportResultsExceedMax() {
    return this.allTerms.length > this.resultsLengthMax;
  }

  @action
  async fetchDownloadData() {
    return [
      [this.intl.t('general.vocabulary'), this.intl.t('general.term')],
      ...this.sortedTerms.map(({ vocabulary, title }) => [vocabulary.title, title]),
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
      @showYearFilter={{false}}
      @description={{@description}}
      @fetchDownloadData={{this.fetchDownloadData}}
      @readyToDownload={{this.allTermsData.isResolved}}
      @resultsLength={{this.allTerms.length}}
    />
    <div data-test-reports-subject-term>
      {{#if this.allTermsData.isResolved}}
        <ul class="report-results{{if this.reportResultsExceedMax ' limited'}}" data-test-results>
          {{#each this.limitedTerms as |term|}}
            <li>
              {{#if this.showSchool}}
                <span data-test-school>
                  {{term.vocabulary.school.title}}:
                </span>
              {{/if}}
              {{term.vocabulary.title}}
              &gt;
              {{term.title}}
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
