import Component from '@glimmer/component';
import { dropTask } from 'ember-concurrency';
import { cached, tracked } from '@glimmer/tracking';
import sortableByPosition from 'ilios-common/utils/sortable-by-position';
import { action } from '@ember/object';
import { TrackedAsyncData } from 'ember-async-data';

export default class LearningMaterialsSortManagerComponent extends Component {
  @tracked sortableObjectList;
  @tracked draggingItem;
  @tracked draggedAboveItem;
  @tracked draggedBelowItem;
  @tracked sortedItems;

  @cached
  get learningMaterials() {
    return new TrackedAsyncData(this.args.subject.learningMaterials);
  }

  get sortedLearningMaterials() {
    if (!this.learningMaterials.isResolved) {
      return [];
    }
    return this.learningMaterials.value.slice().sort(sortableByPosition);
  }

  get items() {
    return this.sortedItems ?? this.sortedLearningMaterials;
  }

  callSave = dropTask(async () => {
    await this.args.save(this.items);
  });

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
    if (this.draggedAboveItem || this.draggedBelowItem) {
      const arr = [...this.items].filter((item) => item !== this.draggingItem);
      if (this.draggedAboveItem) {
        const index = arr.indexOf(this.draggedAboveItem);
        arr.splice(index, 0, this.draggingItem);
      } else if (this.draggedBelowItem) {
        const index = arr.indexOf(this.draggedBelowItem);
        arr.splice(index + 1, 0, this.draggingItem);
      }
      this.sortedItems = arr;
    }
    this.resetHover();
    this.draggingItem = null;
  }

  @action
  dragOver(item, evt) {
    evt.preventDefault();
    this.resetHover();
    if (item !== this.draggingItem) {
      const bounding = evt.target.getBoundingClientRect();
      const offset = bounding.y + bounding.height / 2;
      if (evt.clientY - offset > 0) {
        this.draggedBelowItem = item;
      } else {
        this.draggedAboveItem = item;
      }
    }
  }
}
