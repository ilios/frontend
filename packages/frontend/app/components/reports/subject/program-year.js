import Component from '@glimmer/component';
import { sortBy } from 'ilios-common/utils/array-helpers';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import { service } from '@ember/service';
import { pluralize } from 'ember-inflector';
import { camelize } from '@ember/string';
import { action } from '@ember/object';

export default class ReportsSubjectProgramYearComponent extends Component {
  @service graphql;
  @service currentUser;
  @service intl;

  resultsLengthMax = 200;

  @cached
  get allProgramYearsData() {
    return new TrackedAsyncData(
      this.getReportResults(
        this.args.subject,
        this.args.prepositionalObject,
        this.args.prepositionalObjectTableRowId,
        this.args.school,
      ),
    );
  }

  get allProgramYears() {
    return this.allProgramYearsData.isResolved ? this.allProgramYearsData.value : [];
  }

  get canView() {
    return this.currentUser.performsNonLearnerFunction;
  }

  get showSchool() {
    return !this.args.school;
  }

  get sortedProgramYears() {
    return sortBy(this.allProgramYears, ['program.school.title', 'program.title', 'classOfYear']);
  }

  get limitedProgramYears() {
    return this.sortedProgramYears.slice(0, this.resultsLengthMax);
  }

  async getReportResults(subject, prepositionalObject, prepositionalObjectTableRowId, school) {
    if (subject !== 'program year') {
      throw new Error(`Report for ${subject} sent to ReportsSubjectProgramYearComponent`);
    }

    let filters = [];
    if (school) {
      filters.push(`schools: [${school.id}]`);
    }
    if (prepositionalObject && prepositionalObjectTableRowId) {
      const what = pluralize(camelize(prepositionalObject));
      filters.push(`${what}: [${prepositionalObjectTableRowId}]`);
    }
    const result = await this.graphql.find(
      'programYears',
      filters,
      'id, startYear, program { id, title, duration, school { title } }',
    );

    return result.data.programYears.map((obj) => {
      const classOfYear = Number(obj.startYear) + Number(obj.program.duration);
      obj.classOfYear = String(classOfYear);
      return obj;
    });
  }

  get reportResultsExceedMax() {
    return this.allProgramYears.length > this.resultsLengthMax;
  }

  @action
  async fetchDownloadData() {
    return [
      [this.intl.t('general.year'), this.intl.t('general.program'), this.intl.t('general.school')],
      ...this.sortedProgramYears.map(({ classOfYear, program }) => [
        classOfYear,
        program.title,
        program.school.title,
      ]),
    ];
  }
}
