import Component from '@glimmer/component';
import { use } from 'ember-could-get-used-to-this';
import AsyncProcess from 'ilios-common/classes/async-process';
import { inject as service } from '@ember/service';
import { pluralize } from 'ember-inflector';
import { camelize } from '@ember/string';

export default class ReportsSubjectInstructorGroupComponent extends Component {
  @service graphql;

  @use data = new AsyncProcess(() => [this.getReportResults.bind(this), this.args.report]);

  get finishedLoading() {
    return Array.isArray(this.data);
  }

  async getReportResults(report) {
    const { subject, prepositionalObject, prepositionalObjectTableRowId } = report;

    if (subject !== 'instructor group') {
      throw new Error(`Report for ${subject} sent to ReportsSubjectInstructorGroupComponent`);
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
    const result = await this.graphql.find('instructorGroups', filters, 'title');
    return result.data.instructorGroups.map(({ title }) => title).sort();
  }
}
