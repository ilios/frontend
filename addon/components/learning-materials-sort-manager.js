import Component from '@glimmer/component';
import { dropTask, restartableTask } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import sortableByPosition from 'ilios-common/utils/sortable-by-position';

export default class LearningMaterialsSortManagerComponent extends Component {
  @tracked sortableObjectList;

  @restartableTask
  *load(element, [subject]) {
    const learningMaterials = (yield subject.learningMaterials).toArray();
    this.sortableObjectList = learningMaterials.sort(sortableByPosition);
  }
  @dropTask
  *callSave() {
    yield this.args.save(this.sortableObjectList);
  }
}
