import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { dropTask } from 'ember-concurrency';
import sortableByPosition from 'ilios-common/utils/sortable-by-position';
import { all } from 'rsvp';
import { action } from '@ember/object';
import { use } from 'ember-could-get-used-to-this';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';

export default class ObjectiveSortManagerComponent extends Component {
  @tracked totalObjectivesToSave;
  @tracked currentObjectivesSaved;
  @tracked draggingItem;
  @tracked draggedAboveItem;
  @tracked draggedBelowItem;
  @tracked sortableItems;

  @use objectives = new ResolveAsyncValue(() => [this.args.subject.xObjectives]);
  get sortedObjectives() {
    return this.objectives?.toArray().sort(sortableByPosition) ?? [];
  }

  get saveProgress() {
    const total = this.totalObjectivesToSave || 1;
    const current = this.currentObjectivesSaved || 0;
    return Math.floor((current / total) * 100);
  }

  async saveSomeObjectives(arr) {
    const chunk = arr.splice(0, 5);
    await all(chunk.invoke('save'));
    if (arr.length) {
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

  resetHover() {
    this.draggedAboveItem = null;
    this.draggedBelowItem = null;
  }

  @action
  drag(item) {
    this.draggingItem = item;
  }

  @action
  dragEnd() {
    this.draggingItem = null;
  }

  @action
  dragOver(item, { target, clientY }) {
    this.resetHover();
    const bounding = target.getBoundingClientRect();
    const offset = bounding.y + bounding.height / 2;
    if (clientY - offset > 0) {
      this.draggedBelowItem = item;
    } else {
      this.draggedAboveItem = item;
    }
  }

  @action
  dragLeave() {
    this.resetHover();
  }
}
