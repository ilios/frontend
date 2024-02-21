import Component from '@glimmer/component';
import { restartableTask } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { filterBy } from 'ilios-common/utils/array-helpers';

export default class SchoolSessionTypesCollapseComponent extends Component {
  @tracked sessionTypes = [];

  load = restartableTask(async (element, [school]) => {
    this.sessionTypes = await school.sessionTypes;
  });

  get instructionalMethods() {
    return filterBy(this.sessionTypes, 'assessment', false);
  }

  get assessmentMethods() {
    return filterBy(this.sessionTypes, 'assessment');
  }
}
