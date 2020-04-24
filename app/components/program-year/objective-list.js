import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { dropTask, restartableTask } from 'ember-concurrency-decorators';
import { hash, map } from 'rsvp';
import { inject as service } from '@ember/service';

export default class ProgramYearObjectiveListComponent extends Component {
  @service iliosConfig;
  @service session;

  @tracked objectives;
  @tracked isSorting = false;
  @tracked schoolDomains;
  @tracked schoolCompetencies;
  @tracked course;
  @tracked objectiveCount;

  @restartableTask
  *load(element, [programYear]) {
    if (!programYear) {
      return;
    }
    this.objectiveCount = programYear.hasMany('objectives').ids().length;
    const program = yield programYear.program;
    const school = yield program.school;
    const {
      objectives,
      schoolCompetencies
    } = yield hash({
      objectives: programYear.sortedObjectives,
      schoolCompetencies: school.competencies
    });
    this.objectives = objectives;
    this.schoolCompetencies = schoolCompetencies.toArray();
    this.schoolDomains = yield this.getSchoolDomains(this.schoolCompetencies);
  }

  async getSchoolDomains(schoolCompetencies) {
    const domains = schoolCompetencies.filterBy('isDomain').toArray();
    return await map(domains, async domain => {
      const competencies = (await domain.children).map(competency => {
        return {
          id: competency.id,
          title: competency.title
        };
      });
      return {
        id: domain.id,
        title: domain.title,
        competencies
      };
    });
  }

  get authHeaders(){
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
      headers: this.authHeaders
    });
    const blob = yield response.blob();
    saveAs(blob, 'report.csv');
  }
}
