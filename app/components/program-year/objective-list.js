import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { dropTask } from 'ember-concurrency';
import { map } from 'rsvp';
import { inject as service } from '@ember/service';
import { use } from 'ember-could-get-used-to-this';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';
import AsyncProcess from 'ilios-common/classes/async-process';
import { uniqueValues } from 'ilios-common/utils/array-helpers';

export default class ProgramYearObjectiveListComponent extends Component {
  @service iliosConfig;
  @service session;

  @tracked isSorting = false;

  @use programYearCompetencies = new ResolveAsyncValue(() => [this.args.programYear.competencies]);

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
    const parents = await Promise.all(programYearCompetencies.mapBy('parent'));
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
    const { jwt } = this.session?.data?.authenticated;
    const headers = {};
    if (jwt) {
      headers['X-JWT-Authorization'] = `Token ${jwt}`;
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
