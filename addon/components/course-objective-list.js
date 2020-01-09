import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { dropTask, restartableTask } from 'ember-concurrency-decorators';
import { all } from 'rsvp';
import { timeout } from 'ember-concurrency';

export default class CourseObjectiveListComponent extends Component {
  @tracked objectivesForRemovalConfirmation = [];
  @tracked totalObjectivesToSave = [];
  @tracked currentObjectivesSaved = [];
  @tracked isSorting = false;
  @tracked objectives;

  @restartableTask
  *load() {
    this.objectives = yield this.args.course.sortedObjectives;
  }

  get hasMoreThanOneObjective() {
    return this.objectives && this.objectives.length > 1;
  }

  @dropTask
  *remove(objective) {
    objective.deleteRecord();
    yield objective.save();
  }

  @dropTask
  *saveSortOrder(objectives) {
    yield timeout(1); //let saving animation load
    for (let i = 0, n = objectives.length; i < n; i++) {
      const o = objectives[i];
      o.set('position', i + 1);
    }
    this.totalObjectivesToSave = objectives.length;
    this.currentObjectivesSaved = 0;

    yield this.saveSomeObjectives(objectives);
    this.isSorting = false;
  }

  async saveSomeObjectives(arr){
    const chunk = arr.splice(0, 5);
    await all(chunk.invoke('save'));
    if (arr.length) {
      this.currentObjectivesSaved = this.currentObjectivesSaved + chunk.length;
      return this.saveSomeObjectives(arr);
    }
  }
  @action
  confirmRemoval(objective) {
    this.objectivesForRemovalConfirmation = [...this.objectivesForRemovalConfirmation, objective.id];
  }
  @action
  cancelRemove(objective){
    this.objectivesForRemovalConfirmation = this.objectivesForRemovalConfirmation.filter(id => id !== objective.id);
  }
  @action
  cancelSorting() {
    this.isSorting = false;
  }
}
