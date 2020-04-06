import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { dropTask, restartableTask } from 'ember-concurrency-decorators';
import sortableByPosition from 'ilios-common/utils/sortable-by-position';
import { all } from 'rsvp';

export default class ObjectiveSortManagerComponent extends Component {
  @tracked sortableObjectList;
  @tracked totalObjectivesToSave;
  @tracked currentObjectivesSaved;

  @restartableTask
  *load(element, [subject]) {
    const objectives = (yield subject.objectives).toArray();
    this.sortableObjectList = objectives.sort(sortableByPosition);
  }

  get saveProgress(){
    const total = this.totalObjectivesToSave || 1;
    const current = this.currentObjectivesSaved || 0;
    return Math.floor(current / total * 100);
  }

  async saveSomeObjectives(arr){
    const chunk = arr.splice(0, 5);
    await all(chunk.invoke('save'));
    if (arr.length){
      this.currentObjectivesSaved += chunk.length;
      await this.saveSomeObjectives(arr);
    }
  }

  @dropTask
  *saveSortOrder() {
    const objectives = this.sortableObjectList;
    for (let i = 0, n = objectives.length; i < n; i++) {
      objectives[i].set('position', i + 1);
    }

    this.totalObjectivesToSave = objectives.length;
    this.currentObjectivesSaved = 0;

    yield this.saveSomeObjectives(objectives);
    this.args.close();
  }
}
