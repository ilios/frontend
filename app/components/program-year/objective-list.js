import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { enqueueTask, dropTask, restartableTask } from 'ember-concurrency-decorators';
import { action } from '@ember/object';
import { all } from 'rsvp';

export default class ProgramYearObjectiveListComponent extends Component {
  @service ajax;
  @service iliosConfig;
  @service session;

  @tracked objectives;
  @tracked objectivesForRemovalConfirmation = [];
  @tracked totalObjectivesToSave;
  @tracked currentObjectivesSaved;
  @tracked isSorting = false;
  @tracked expandedObjectiveIds = [];

  get authHeaders(){
    const { jwt } = this.session?.data?.authenticated;
    const headers = {};
    if (jwt) {
      headers['X-JWT-Authorization'] = `Token ${jwt}`;
    }

    return new Headers(headers);
  }

  @restartableTask
  *load(element, [programYear]) {
    if (!programYear) {
      return;
    }
    this.objectives = yield programYear.sortedObjectives;
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
  @action
  toggleExpand(objectiveId) {
    if (this.expandedObjectiveIds.includes(objectiveId)) {
      this.expandedObjectiveIds = this.expandedObjectiveIds.filter(id => id !== objectiveId);
    } else {
      this.expandedObjectiveIds = [...this.expandedObjectiveIds, objectiveId];
    }
  }

  @dropTask
  *downloadReport() {
    const apiPath = '/' + this.iliosConfig.apiNameSpace;
    const resourcePath = `/programyears/${this.args.programYear.id}/downloadobjectivesmapping`;
    const host = this.iliosConfig.apiHost ?? `${window.location.protocol}//${window.location.host}`;
    const url = host + apiPath + resourcePath;
    const { saveAs } = yield import('file-saver');

    const response = yield fetch(url, {
      headers: this.authHeaders
    });
    const blob = yield response.blob();
    saveAs(blob, 'report.csv');
  }
}
