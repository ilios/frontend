import Component from '@glimmer/component';
import { use } from 'ember-could-get-used-to-this';
import AsyncProcess from 'ilios-common/classes/async-process';
import { inject as service } from '@ember/service';
import { pluralize } from 'ember-inflector';
import { camelize } from '@ember/string';

export default class ReportsSubjectSessionTypeComponent extends Component {
  @service graphql;
  @service intl;

  @use data = new AsyncProcess(() => [this.getReportResults.bind(this), this.args.report]);

  get finishedLoading() {
    return Array.isArray(this.data);
  }

  get sortedData() {
    return this.data?.sort((a, b) => {
      return a.localeCompare(b, this.intl.primaryLocale);
    });
  }

  async getGraphQLFilters(report) {
    let { prepositionalObject, prepositionalObjectTableRowId } = report;

    const school = await report.school;

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

  async getReportResults(report) {
    const { subject } = report;

    if (subject !== 'session type') {
      throw new Error(`Report for ${subject} sent to ReportsSubjectSessionTypeComponent`);
    }

    const filters = await this.getGraphQLFilters(report);
    const result = await this.graphql.find('sessionTypes', filters, 'title');
    return result.data.sessionTypes.map(({ title }) => title);
  }
}
