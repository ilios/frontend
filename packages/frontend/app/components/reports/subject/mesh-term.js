import Component from '@glimmer/component';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import { service } from '@ember/service';
import { pluralize } from 'ember-inflector';
import { camelize } from '@ember/string';

export default class ReportsSubjectMeshTermComponent extends Component {
  @service graphql;
  @service intl;

  @cached
  get data() {
    return new TrackedAsyncData(
      this.getReportResults(
        this.args.subject,
        this.args.prepositionalObject,
        this.args.prepositionalObjectTableRowId,
        this.args.school,
      ),
    );
  }

  get sortedData() {
    return this.data.value.sort((a, b) => {
      return a.localeCompare(b, this.intl.primaryLocale);
    });
  }

  async getReportResults(subject, prepositionalObject, prepositionalObjectTableRowId, school) {
    if (subject !== 'mesh term') {
      throw new Error(`Report for ${subject} sent to ReportsSubjectMeshTermComponent`);
    }

    let filters = [];
    if (school) {
      filters.push(`schools: [${school.id}]`);
    }
    if (prepositionalObject && prepositionalObjectTableRowId) {
      const what = pluralize(camelize(prepositionalObject));
      filters.push(`${what}: [${prepositionalObjectTableRowId}]`);
    }
    const result = await this.graphql.find('meshDescriptors', filters, 'id, name');
    return result.data.meshDescriptors.map(({ name }) => name);
  }
}
