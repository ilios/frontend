import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { restartableTask } from 'ember-concurrency-decorators';
import sortableByPosition from 'ilios-common/utils/sortable-by-position';

export default class ObjectiveSortManagerComponent extends Component {
  @tracked sortableObjectList;

  @restartableTask
  *load(element, [subject]) {
    const objectives = (yield subject.objectives).toArray();
    this.sortableObjectList = objectives.sort(sortableByPosition);
  }
}
