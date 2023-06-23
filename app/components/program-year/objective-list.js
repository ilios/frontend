import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { dropTask } from 'ember-concurrency';
import { map } from 'rsvp';
import { inject as service } from '@ember/service';
import { use } from 'ember-could-get-used-to-this';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import AsyncProcess from 'ilios-common/classes/async-process';
import { mapBy, uniqueValues } from 'ilios-common/utils/array-helpers';

export default class ProgramYearObjectiveListComponent extends Component {
  @service iliosConfig;
  @service session;

  @tracked isSorting = false;

  @cached
  get programYearCompetenciesData() {
    return new TrackedAsyncData(this.args.programYear.competencies);
  }

  @cached
  get programYearCompetencies() {
    return this.programYearCompetenciesData.isResolved
      ? this.programYearCompetenciesData.value
      : null;
  }

  @use domainTrees = new AsyncProcess(() => [
    this.getDomainTrees.bind(this),
    this.programYearCompetencies ?? [],
  ]);

  get programYearObjectiveCount() {
    return this.args.programYear.programYearObjectives.length;
  }

  async getDomainTrees(programYearCompetencies) {
    const domains = programYearCompetencies.slice().filter((competency) => {
      return !competency.belongsTo('parent').id();
    });
    const parents = await Promise.all(mapBy(programYearCompetencies, 'parent'));
    const allDomains = uniqueValues([...domains, ...parents]).filter(Boolean);
    return await map(allDomains, async (domain) => {
      const competencies = (await domain.children).map((competency) => {
        return {
          id: competency.id,
          title: competency.title,
        };
      });
      return {
        id: domain.id,
        title: domain.title,
        competencies,
      };
    });
  }

  get authHeaders() {
    const headers = {};
    if (this.session?.isAuthenticated) {
      const { jwt } = this.session.data.authenticated;
      if (jwt) {
        headers['X-JWT-Authorization'] = `Token ${jwt}`;
      }
    }

    return new Headers(headers);
  }

  @dropTask
  *downloadReport() {
    const apiPath = '/' + this.iliosConfig.apiNameSpace;
    const resourcePath = `/programyears/${this.args.programYear.id}/downloadobjectivesmapping`;
    const host = this.iliosConfig.apiHost ?? `${window.location.protocol}//${window.location.host}`;
    const url = host + apiPath + resourcePath;
    const { saveAs } = yield import('file-saver');

    const response = yield fetch(url, {
      headers: this.authHeaders,
    });
    const blob = yield response.blob();
    saveAs(blob, 'report.csv');
  }
}
