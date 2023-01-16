import Component from '@glimmer/component';
import { use } from 'ember-could-get-used-to-this';
import AsyncProcess from 'ilios-common/classes/async-process';
import { inject as service } from '@ember/service';
import { pluralize } from 'ember-inflector';
import { camelize } from '@ember/string';
import { sortBy } from 'ilios-common/utils/array-helpers';

export default class ReportsSubjectTermComponent extends Component {
  @service graphql;

  @use data = new AsyncProcess(() => [this.getReportResults.bind(this), this.args.report]);

  get finishedLoading() {
    return Array.isArray(this.data);
  }

  get sortedData() {
    return sortBy(this.data, ['vocabulary.title', 'title']);
  }

  async getReportResults(report) {
    const { subject, prepositionalObject, prepositionalObjectTableRowId } = report;

    if (subject !== 'term') {
      throw new Error(`Report for ${subject} sent to ReportsSubjectTermComponent`);
    }

    const school = await report.school;

    let filters = [];
    if (school) {
      filters.push(`schools: [${school.id}]`);
    }
    if (prepositionalObject && prepositionalObjectTableRowId) {
      const what = pluralize(camelize(prepositionalObject));
      filters.push(`${what}: [${prepositionalObjectTableRowId}]`);
    }
    const result = await this.graphql.find('terms', filters, 'id, title, vocabulary { id, title }');
    return result.data.terms;
  }
}
