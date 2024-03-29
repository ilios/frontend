import Component from '@glimmer/component';
import { use } from 'ember-could-get-used-to-this';
import AsyncProcess from 'ilios-common/classes/async-process';
import { service } from '@ember/service';
import { pluralize } from 'ember-inflector';
import { camelize } from '@ember/string';

export default class ReportsSubjectLearningMaterialComponent extends Component {
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

  async getGraphQLFilters(prepositionalObject, prepositionalObjectTableRowId, school) {
    let rhett = [];
    if (school) {
      rhett.push(`schools: [${school.id}]`);
    }
    if (prepositionalObject && prepositionalObjectTableRowId) {
      let what = pluralize(camelize(prepositionalObject));
      if (what === 'course') {
        what = 'fullCourses';
      }
      if (prepositionalObject === 'mesh term') {
        what = 'meshDescriptors';
        prepositionalObjectTableRowId = `"${prepositionalObjectTableRowId}"`;
      }
      rhett.push(`${what}: [${prepositionalObjectTableRowId}]`);
    }

    return rhett;
  }

  async getReportResults(subject, prepositionalObject, prepositionalObjectTableRowId, school) {
    if (subject !== 'learning material') {
      throw new Error(`Report for ${subject} sent to ReportsSubjectLearningMaterialComponent`);
    }

    const filters = await this.getGraphQLFilters(
      prepositionalObject,
      prepositionalObjectTableRowId,
      school,
    );
    const result = await this.graphql.find('learningMaterials', filters, 'id, title');
    return result.data.learningMaterials.map(({ title }) => title);
  }
}
