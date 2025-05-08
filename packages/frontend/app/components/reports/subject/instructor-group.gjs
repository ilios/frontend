import Component from '@glimmer/component';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import { service } from '@ember/service';
import { pluralize } from 'ember-inflector';
import { camelize } from '@ember/string';
import { action } from '@ember/object';

export default class ReportsSubjectInstructorGroupComponent extends Component {
  @service graphql;
  @service intl;

  resultsLengthMax = 200;

  @cached
  get allInstructorGroupsData() {
    return new TrackedAsyncData(
      this.getReportResults(
        this.args.subject,
        this.args.prepositionalObject,
        this.args.prepositionalObjectTableRowId,
        this.args.school,
      ),
    );
  }

  get allInstructorGroups() {
    return this.allInstructorGroupsData.isResolved ? this.allInstructorGroupsData.value : [];
  }

  get sortedInstructorGroups() {
    return this.allInstructorGroups.sort((a, b) => {
      return a.localeCompare(b, this.intl.primaryLocale);
    });
  }

  get limitedInstructorGroups() {
    return this.sortedInstructorGroups.slice(0, this.resultsLengthMax);
  }

  async getReportResults(subject, prepositionalObject, prepositionalObjectTableRowId, school) {
    if (subject !== 'instructor group') {
      throw new Error(`Report for ${subject} sent to ReportsSubjectInstructorGroupComponent`);
    }

    let filters = [];
    if (school) {
      filters.push(`schools: [${school.id}]`);
    }
    if (prepositionalObject && prepositionalObjectTableRowId) {
      const what = pluralize(camelize(prepositionalObject));
      filters.push(`${what}: [${prepositionalObjectTableRowId}]`);
    }
    const result = await this.graphql.find('instructorGroups', filters, 'title');
    return result.data.instructorGroups.map(({ title }) => title);
  }

  get reportResultsExceedMax() {
    return this.allInstructorGroups.length > this.resultsLengthMax;
  }

  @action
  async fetchDownloadData() {
    return [
      [this.intl.t('general.instructorGroups')],
      ...this.sortedInstructorGroups.map((v) => [v]),
    ];
  }
}

<Reports::SubjectHeader
  @report={{@report}}
  @school={{@school}}
  @subject={{@subject}}
  @prepositionalObject={{@prepositionalObject}}
  @prepositionalObjectTableRowId={{@prepositionalObjectTableRowId}}
  @year={{@year}}
  @showYearFilter={{false}}
  @description={{@description}}
  @fetchDownloadData={{this.fetchDownloadData}}
  @readyToDownload={{this.allInstructorGroupsData.isResolved}}
  @resultsLength={{this.allInstructorGroups.length}}
/>
<div data-test-reports-subject-instructor-group>
  {{#if this.allInstructorGroupsData.isResolved}}
    <ul class="report-results{{if this.reportResultsExceedMax ' limited'}}" data-test-results>
      {{#each this.limitedInstructorGroups as |title|}}
        <li>
          {{title}}
        </li>
      {{else}}
        <li>{{t "general.none"}}</li>
      {{/each}}
    </ul>
    {{#if this.reportResultsExceedMax}}
      <Reports::SubjectDownload
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