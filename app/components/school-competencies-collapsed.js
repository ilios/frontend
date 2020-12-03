import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { restartableTask } from 'ember-concurrency-decorators';

export default class SchoolCompetenciesCollapsedComponent extends Component {
  @tracked competenciesRelationship;
  @tracked domains = [];
  @tracked childCompetencies = [];

  get competencies() {
    return this.competenciesRelationship ? this.competenciesRelationship.toArray() : [];
  }

  @restartableTask
  *load() {
    this.competenciesRelationship = yield this.args.school.competencies;
  }
}
