import Component from '@glimmer/component';
import { use } from 'ember-could-get-used-to-this';
import AsyncProcess from 'ilios-common/classes/async-process';
import { inject as service } from '@ember/service';
import { pluralize } from 'ember-inflector';
import { camelize } from '@ember/string';

export default class ReportsSubjectLearningMaterialComponent extends Component {
  @service graphql;

  @use data = new AsyncProcess(() => [this.getReportResults.bind(this), this.args.report]);

  get finishedLoading() {
    return Array.isArray(this.data);
  }

  async getReportResults(report) {
    const { subject, prepositionalObject, prepositionalObjectTableRowId } = report;

    if (subject !== 'learning material') {
      throw new Error(`Report for ${subject} sent to ReportsSubjectLearningMaterialComponent`);
    }

    const school = await report.school;

    let filters = [];
    if (school) {
      filters.push(`schools: [${school.id}]`);
    }
    if (prepositionalObject && prepositionalObjectTableRowId) {
      let what = pluralize(camelize(prepositionalObject));
      if (what === 'course') {
        what = 'fullCourses';
      }
      filters.push(`${what}: [${prepositionalObjectTableRowId}]`);
    }
    const result = await this.graphql.find('learningMaterials', filters, 'id, title');
    return result.data.learningMaterials.map(({ title }) => title).sort();
  }
}
