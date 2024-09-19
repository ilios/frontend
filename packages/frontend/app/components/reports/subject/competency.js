import Component from '@glimmer/component';
import { service } from '@ember/service';
import { pluralize } from 'ember-inflector';
import { camelize } from '@ember/string';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';

export default class ReportsSubjectCompetencyComponent extends Component {
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
    if (subject !== 'competency') {
      throw new Error(`Report for ${subject} sent to ReportsSubjectCompetencyComponent`);
    }

    let filters = [];
    if (school) {
      filters.push(`schools: [${school.id}]`);
    }
    if (prepositionalObject && prepositionalObjectTableRowId) {
      const what = pluralize(camelize(prepositionalObject));
      filters.push(`${what}: [${prepositionalObjectTableRowId}]`);
    }
    const result = await this.graphql.find('competencies', filters, 'id, title');
    return result.data.competencies.map(({ title }) => title);
  }
}
