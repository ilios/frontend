import Component from '@glimmer/component';
import { restartableTask } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { filterBy } from 'ilios-common/utils/array-helpers';

export default class SchoolSessionTypesCollapseComponent extends Component {
  @tracked sessionTypes = [];

  @restartableTask
  *load(element, [school]) {
    this.sessionTypes = yield school.sessionTypes;
  }

  get instructionalMethods() {
    return filterBy(this.sessionTypes, 'assessment', false);
  }

  get assessmentMethods() {
    return filterBy(this.sessionTypes, 'assessment');
  }
}
