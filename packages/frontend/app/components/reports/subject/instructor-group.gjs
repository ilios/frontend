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
    if (this.showSchool) {
      return sortBy(this.allInstructorGroups, ['school.title', 'title']);
    }

    return sortBy(this.allInstructorGroups, ['title']);
  }

  get limitedInstructorGroups() {
    return this.sortedInstructorGroups.slice(0, this.resultsLengthMax);
  }

  get showSchool() {
    return !this.args.school;
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
    const attributes = ['title', 'school { title }'];
    const result = await this.graphql.find('instructorGroups', filters, attributes.join(', '));
    return result.data.instructorGroups;
  }

  get reportResultsExceedMax() {
    return this.allInstructorGroups.length > this.resultsLengthMax;
  }

  @action
  async fetchDownloadData() {
    if (this.showSchool) {
      return [
        [this.intl.t('general.school'), this.intl.t('general.instructorGroups')],
        ...this.sortedInstructorGroups.map(({ school, title }) => [school.title, title]),
      ];
    }
    return [
      [this.intl.t('general.instructorGroups')],
      ...this.sortedInstructorGroups.map(({ title }) => [title]),
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
      @readyToDownload={{this.allInstructorGroupsData.isResolved}}
      @resultsLength={{this.allInstructorGroups.length}}
    />
    <div data-test-reports-subject-instructor-group>
      {{#if this.allInstructorGroupsData.isResolved}}
        <ul class="report-results{{if this.reportResultsExceedMax ' limited'}}" data-test-results>
          {{#each this.limitedInstructorGroups as |instructorGroup|}}
            <li>
              {{#if this.showSchool}}
                <span class="school" data-test-school>
                  {{instructorGroup.school.title}}:
                </span>
              {{/if}}
              {{instructorGroup.title}}
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
