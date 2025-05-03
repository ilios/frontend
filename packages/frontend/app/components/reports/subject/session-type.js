import Component from '@glimmer/component';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import { service } from '@ember/service';
import { pluralize } from 'ember-inflector';
import { camelize } from '@ember/string';
import { action } from '@ember/object';

export default class ReportsSubjectSessionTypeComponent extends Component {
  @service graphql;
  @service intl;

  resultsLengthMax = 200;
  controller = new AbortController();
  signal = this.controller.signal;

  cancelCurrentRun() {
    this.controller = new AbortController();
    this.signal = this.controller.signal;
  }

  @cached
  get allSessionTypesData() {
    return new TrackedAsyncData(
      this.getReportResults(
        this.args.subject,
        this.args.prepositionalObject,
        this.args.prepositionalObjectTableRowId,
        this.args.school,
      ),
    );
  }

  get allSessionTypes() {
    return this.allSessionTypesData.isResolved ? this.allSessionTypesData.value : [];
  }

  get sortedSessionTypes() {
    return this.allSessionTypes.sort((a, b) => {
      return a.localeCompare(b, this.intl.primaryLocale);
    });
  }

  get limitedSessionTypes() {
    return this.sortedSessionTypes.slice(0, this.resultsLengthMax);
  }

  async getGraphQLFilters(prepositionalObject, prepositionalObjectTableRowId, school) {
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

  async getReportResults(subject, prepositionalObject, prepositionalObjectTableRowId, school) {
    if (subject !== 'session type') {
      throw new Error(`Report for ${subject} sent to ReportsSubjectSessionTypeComponent`);
    }

    const filters = await this.getGraphQLFilters(
      prepositionalObject,
      prepositionalObjectTableRowId,
      school,
    );

    if (this.graphql.findTask.isRunning) {
      this.controller.abort('running query canceled so new one could run');
    }
    this.cancelCurrentRun();

    const result = await this.graphql.findTask.perform(
      'sessionTypes',
      filters,
      'title',
      this.signal,
    );
    return result.data.sessionTypes.map(({ title }) => title);
  }

  get reportResultsExceedMax() {
    return this.allSessionTypes.length > this.resultsLengthMax;
  }

  @action
  async fetchDownloadData() {
    return [[this.intl.t('general.sessionTypes')], ...this.sortedSessionTypes.map((v) => [v])];
  }
}
