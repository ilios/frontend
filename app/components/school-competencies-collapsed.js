import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { restartableTask } from 'ember-concurrency';

export default class SchoolCompetenciesCollapsedComponent extends Component {
  @tracked competenciesRelationship;

  get competencies() {
    return this.competenciesRelationship ? this.competenciesRelationship.toArray() : [];
  }

  get domains() {
    return this.competencies.filter((competency) => {
      return !competency.belongsTo('parent').id();
    });
  }

  get notDomains() {
    return this.competencies.filter((competency) => {
      return competency.belongsTo('parent').id();
    });
  }

  @restartableTask
  *load() {
    this.competenciesRelationship = yield this.args.school.competencies;
  }
}
