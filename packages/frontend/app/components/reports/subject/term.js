import Component from '@glimmer/component';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import { service } from '@ember/service';
import { pluralize } from 'ember-inflector';
import { camelize } from '@ember/string';
import { sortBy } from 'ilios-common/utils/array-helpers';
import { action } from '@ember/object';

export default class ReportsSubjectTermComponent extends Component {
  @service graphql;
  @service intl;

  resultsLengthMax = 200;

  @cached
  get allTermsData() {
    return new TrackedAsyncData(
      this.getReportResults(
        this.args.subject,
        this.args.prepositionalObject,
        this.args.prepositionalObjectTableRowId,
        this.args.school,
      ),
    );
  }

  get allTerms() {
    return this.allTermsData.isResolved ? this.allTermsData.value : [];
  }

  get sortedTerms() {
    return sortBy(this.allTerms, ['vocabulary.title', 'title']);
  }

  get limitedTerms() {
    return this.sortedTerms.slice(0, this.resultsLengthMax);
  }

  async getReportResults(subject, prepositionalObject, prepositionalObjectTableRowId, school) {
    if (subject !== 'term') {
      throw new Error(`Report for ${subject} sent to ReportsSubjectTermComponent`);
    }

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

  get reportResultsExceedMax() {
    return this.allTerms.length > this.resultsLengthMax;
  }

  @action
  async fetchDownloadData() {
    return [
      [this.intl.t('general.vocabulary'), this.intl.t('general.term')],
      ...this.sortedTerms.map(({ vocabulary, title }) => [vocabulary.title, title]),
    ];
  }
}
