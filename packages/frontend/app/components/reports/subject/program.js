import Component from '@glimmer/component';
import { sortBy } from 'ilios-common/utils/array-helpers';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import { service } from '@ember/service';
import { pluralize } from 'ember-inflector';
import { camelize } from '@ember/string';
import { action } from '@ember/object';

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
    const result = await this.graphql.find('programs', filters, 'id, title, school { title }');
    return result.data.programs;
  }

  get reportResultsExceedMax() {
    return this.allPrograms.length > this.resultsLengthMax;
  }

  @action
  async fetchDownloadData() {
    return [
      [this.intl.t('general.program'), this.intl.t('general.school')],
      ...this.sortedPrograms.map(({ title, school }) => [title, school.title]),
    ];
  }
}
