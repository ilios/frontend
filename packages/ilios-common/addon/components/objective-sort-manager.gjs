import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import sortableByPosition from 'ilios-common/utils/sortable-by-position';
import { all } from 'rsvp';
import { action } from '@ember/object';
import { TrackedAsyncData } from 'ember-async-data';
import { on } from '@ember/modifier';
import perform from 'ember-concurrency/helpers/perform';
import FaIcon from 'ilios-common/components/fa-icon';
import eq from 'ember-truth-helpers/helpers/eq';
import { fn } from '@ember/helper';
import t from 'ember-intl/helpers/t';
import FadeText from 'ilios-common/components/fade-text';

export default class ObjectiveSortManagerComponent extends Component {
  @tracked totalObjectivesToSave;
  @tracked currentObjectivesSaved;
  @tracked draggingItem;
  @tracked draggedAboveItem;
  @tracked draggedBelowItem;
  @tracked sortedItems;

  @cached
  get objectives() {
    return new TrackedAsyncData(this.args.subject.xObjectives);
  }

  get sortedObjectives() {
    if (!this.objectives.isResolved) {
      return [];
    }
    return this.objectives.value.slice().sort(sortableByPosition);
  }

  get items() {
    return this.sortedItems ?? this.sortedObjectives;
  }

  get saveProgress() {
    const total = this.totalObjectivesToSave || 1;
    const current = this.currentObjectivesSaved || 0;
    return Math.floor((current / total) * 100);
  }

  async saveSomeObjectives(arr) {
    const chunk = arr.splice(0, 5);
    await await all(chunk.map((o) => o.save()));
    if (arr.length) {
      this.currentObjectivesSaved += chunk.length;
      await this.saveSomeObjectives(arr);
    }
  }

  saveSortOrder = task({ drop: true }, async () => {
    const objectives = this.items;
    for (let i = 0, n = objectives.length; i < n; i++) {
      objectives[i].set('position', i + 1);
    }

    this.totalObjectivesToSave = objectives.length;
    this.currentObjectivesSaved = 0;

    await this.saveSomeObjectives(objectives);
    this.args.close();
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
  <template>
    <div class="objective-sort-manager">
      <div class="actions">
        <button
          class="bigadd"
          type="button"
          disabled={{this.saveSortOrder.isRunning}}
          aria-label={{t "general.save"}}
          {{on "click" (perform this.saveSortOrder)}}
        >
          {{#if this.saveSortOrder.isRunning}}
            <FaIcon @icon="spinner" @spin={{true}} />
            {{this.saveProgress}}%
          {{else}}
            <FaIcon @icon="check" />
          {{/if}}
        </button>
        <button
          class="bigcancel"
          type="button"
          disabled={{this.saveSortOrder.isRunning}}
          aria-label={{t "general.cancel"}}
          {{on "click" @close}}
        >
          <FaIcon @icon="arrow-rotate-left" />
        </button>
      </div>
      <div class="content">
        <ul class="sortable-items">
          {{#each this.items as |item|}}
            <li
              class="item{{if (eq this.draggingItem item) ' dragging-item'}}{{if
                  (eq this.draggedAboveItem item)
                  ' dragged-above'
                }}{{if (eq this.draggedBelowItem item) ' dragged-below'}}"
              draggable="true"
              {{on "drag" (fn this.drag item)}}
              {{on "dragend" this.dragEnd}}
              {{on "dragover" (fn this.dragOver item)}}
            >
              {{#unless this.saveSortOrder.isRunning}}
                <FaIcon @icon="up-down-left-right" />
              {{/unless}}
              <span class="draggable-object-content">
                <FadeText @text={{item.title}} />
              </span>
            </li>
          {{/each}}
        </ul>
      </div>
    </div>
  </template>
}
