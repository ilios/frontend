import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { enqueueTask, dropTask, restartableTask } from 'ember-concurrency-decorators';
import { action } from '@ember/object';
import { all } from 'rsvp';

export default class CourseObjectiveListComponent extends Component {
  @tracked objectives;
  @tracked objectivesForRemovalConfirmation = [];
  @tracked totalObjectivesToSave;
  @tracked currentObjectivesSaved;
  @tracked isSorting = false;

  @restartableTask
  *load(element, [course]) {
    if (!course) {
      return;
    }
    this.objectives = yield course.sortedObjectives;
  }

  get hasMoreThanOneObjective() {
    return this.objectives?.length > 1;
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
  *saveSortOrder(objectives){
    for (let i = 0, n = objectives.length; i < n; i++) {
      objectives[i].set('position', i + 1);
    }

    this.totalObjectivesToSave = objectives.length;
    this.currentObjectivesSaved = 0;

    yield this.saveSomeObjectives(objectives);
    this.isSorting = false;
  }

  @enqueueTask
  *deleteObjective(objective) {
    yield objective.destroyRecord();
  }
  @action
  confirmRemoval(objective) {
    this.objectivesForRemovalConfirmation = [...this.objectivesForRemovalConfirmation, objective.id];
  }
  @action
  cancelRemove(objective){
    this.objectivesForRemovalConfirmation = this.objectivesForRemovalConfirmation.filter(id => id !== objective.id);
  }
}
