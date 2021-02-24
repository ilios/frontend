import Component from '@glimmer/component';
import { restartableTask } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';

export default class SchoolSessionTypesCollapseComponent extends Component {
  @tracked sessionTypes = [];

  @restartableTask
  *load(element, [school]) {
    this.sessionTypes = yield school.sessionTypes;
  }

  get instructionalMethods() {
    return this.sessionTypes.filterBy('assessment', false);
  }

  get assessmentMethods() {
    return this.sessionTypes.filterBy('assessment');
  }
}
