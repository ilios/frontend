import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { restartableTask } from 'ember-concurrency-decorators';
import { inject as service } from '@ember/service';

export default class CollapsedCompetenciesComponent extends Component {
  @service store;
  @tracked competenciesRelationship;
  @tracked allSchools;

  @restartableTask
  *load(element, [subject]) {
    this.competenciesRelationship = yield subject.competencies;
    this.allSchools = yield this.store.findAll('school');
  }

  get summary() {
    if (!this.allSchools || !this.competenciesRelationship) {
      return [];
    }
    const schools = this.competenciesRelationship.reduce(
      (schools, competency) => {
        const schoolId = competency.belongsTo('school').id();
        if (!(schoolId in schools)) {
          schools[schoolId] = {
            competencies: [],
            school: this.allSchools.findBy('id', schoolId),
          };
        }
        schools[schoolId].competencies.push(competency);

        return schools;
      },
      {}
    );

    return Object.values(schools);
  }
}
