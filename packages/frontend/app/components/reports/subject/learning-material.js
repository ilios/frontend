import Component from '@glimmer/component';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import { service } from '@ember/service';
import { pluralize } from 'ember-inflector';
import { camelize } from '@ember/string';
import { action } from '@ember/object';

export default class ReportsSubjectLearningMaterialComponent extends Component {
  @service graphql;
  @service intl;

  resultsLengthMax = 200;

  @cached
  get allLearningMaterialsData() {
    return new TrackedAsyncData(
      this.getReportResults(
        this.args.subject,
        this.args.prepositionalObject,
        this.args.prepositionalObjectTableRowId,
        this.args.school,
      ),
    );
  }

  get allLearningMaterials() {
    return this.allLearningMaterialsData.isResolved ? this.allLearningMaterialsData.value : [];
  }

  get sortedLearningMaterials() {
    return this.allLearningMaterials.sort((a, b) => {
      return a.localeCompare(b, this.intl.primaryLocale);
    });
  }

  get limitedLearningMaterials() {
    return this.sortedLearningMaterials.slice(0, this.resultsLengthMax);
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

  get reportResultsExceedMax() {
    return this.allLearningMaterials.length > this.resultsLengthMax;
  }

  get resultsLengthDisplay() {
    if (this.args.year) {
      return `${this.sortedLearningMaterials.length}/${this.allLearningMaterials.length}`;
    }

    return this.allLearningMaterials.length;
  }

  @action
  async fetchDownloadData() {
    return [
      [this.intl.t('general.learningMaterials')],
      ...this.sortedLearningMaterials.map((v) => [v]),
    ];
  }
}
