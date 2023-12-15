import Component from '@glimmer/component';
import { use } from 'ember-could-get-used-to-this';
import AsyncProcess from 'ilios-common/classes/async-process';
import { service } from '@ember/service';
import { pluralize } from 'ember-inflector';
import { camelize } from '@ember/string';

export default class ReportsSubjectInstructorGroupComponent extends Component {
  @service graphql;
  @service intl;

  @use data = new AsyncProcess(() => [
    this.getReportResults.bind(this),
    this.args.subject,
    this.args.prepositionalObject,
    this.args.prepositionalObjectTableRowId,
    this.args.school,
  ]);

  get finishedLoading() {
    return Array.isArray(this.data);
  }

  get sortedData() {
    return this.data?.sort((a, b) => {
      return a.localeCompare(b, this.intl.primaryLocale);
    });
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
}
