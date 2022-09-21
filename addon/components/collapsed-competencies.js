import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { restartableTask } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { findById } from '../utils/array-helpers';

export default class CollapsedCompetenciesComponent extends Component {
  @service store;
  @tracked competenciesRelationship;
  @tracked allSchools;

  load = restartableTask(async (element, [subject]) => {
    this.competenciesRelationship = await subject.competencies;
    this.allSchools = await this.store.findAll('school');
  });

  get summary() {
    if (!this.allSchools || !this.competenciesRelationship) {
      return [];
    }
    const schools = this.competenciesRelationship.reduce((schools, competency) => {
      const schoolId = competency.belongsTo('school').id();
      if (!(schoolId in schools)) {
        schools[schoolId] = {
          competencies: [],
          school: findById(this.allSchools, schoolId),
        };
      }
      schools[schoolId].competencies.push(competency);

      return schools;
    }, {});

    return Object.values(schools);
  }
}
