import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { dropTask } from 'ember-concurrency';
import { map } from 'rsvp';
import { service } from '@ember/service';
import { TrackedAsyncData } from 'ember-async-data';
import { mapBy, uniqueValues } from 'ilios-common/utils/array-helpers';
import sortableByPosition from 'ilios-common/utils/sortable-by-position';

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
      : [];
  }

  @cached
  get domainTreesData() {
    return new TrackedAsyncData(this.getDomainTrees(this.programYearCompetencies));
  }

  get domainTrees() {
    return this.domainTreesData.isResolved ? this.domainTreesData.value : [];
  }

  @cached
  get programYearObjectivesData() {
    return new TrackedAsyncData(this.args.programYear.programYearObjectives);
  }

  get sortedProgramYearObjectives() {
    return this.programYearObjectivesData.isResolved
      ? this.programYearObjectivesData.value.slice().sort(sortableByPosition)
      : [];
  }

  get programYearObjectiveCount() {
    return this.args.programYear.programYearObjectives.length;
  }

  async getDomainTrees(programYearCompetencies) {
    const domains = programYearCompetencies.filter((competency) => {
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

  downloadReport = dropTask(async () => {
    const apiPath = '/' + this.iliosConfig.apiNameSpace;
    const resourcePath = `/programyears/${this.args.programYear.id}/downloadobjectivesmapping`;
    const host = this.iliosConfig.apiHost ?? `${window.location.protocol}//${window.location.host}`;
    const url = host + apiPath + resourcePath;
    const { default: saveAs } = await import('file-saver');
    const response = await fetch(url, {
      headers: this.authHeaders,
    });
    const blob = await response.blob();
    saveAs(blob, 'report.csv');
  });
}
