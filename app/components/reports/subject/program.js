import Component from '@glimmer/component';
import { sortBy } from 'ilios-common/utils/array-helpers';
import { use } from 'ember-could-get-used-to-this';
import AsyncProcess from 'ilios-common/classes/async-process';
import { inject as service } from '@ember/service';
import { pluralize } from 'ember-inflector';
import { camelize } from '@ember/string';

export default class ReportsSubjectProgramComponent extends Component {
  @service graphql;
  @service currentUser;

  @use data = new AsyncProcess(() => [this.getReportResults.bind(this), this.args.report]);

  get canView() {
    return this.currentUser.performsNonLearnerFunction;
  }

  get showSchool() {
    return !this.args.report.belongsTo('school').id();
  }

  get sortedPrograms() {
    return sortBy(this.data, ['school.title', 'title']);
  }

  get finishedLoading() {
    return Array.isArray(this.data);
  }

  async getReportResults(report) {
    const { subject, prepositionalObject, prepositionalObjectTableRowId } = report;

    if (subject !== 'program') {
      throw new Error(`Report for ${subject} sent to ReportsSubjectProgramComponent`);
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
    const result = await this.graphql.find('programs', filters, 'id, title, school { title }');

    return result.data.programs;
  }
}
