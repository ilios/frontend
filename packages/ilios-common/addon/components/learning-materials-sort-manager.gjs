import Component from '@glimmer/component';
import { dropTask } from 'ember-concurrency';
import { cached, tracked } from '@glimmer/tracking';
import sortableByPosition from 'ilios-common/utils/sortable-by-position';
import { action } from '@ember/object';
import { TrackedAsyncData } from 'ember-async-data';
import { on } from '@ember/modifier';
import perform from 'ember-concurrency/helpers/perform';
import FaIcon from 'ilios-common/components/fa-icon';
import eq from 'ember-truth-helpers/helpers/eq';
import { fn } from '@ember/helper';
import LmTypeIcon from 'ilios-common/components/lm-type-icon';
import capitalize from 'ilios-common/helpers/capitalize';
import t from 'ember-intl/helpers/t';

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
  <template>
    <div class="learning-materials-sort-manager" data-test-detail-learning-materials-sort-manager>
      {{#if this.learningMaterials.isResolved}}
        <div class="actions">
          <button
            class="bigadd"
            type="button"
            aria-label={{t "general.save"}}
            {{on "click" (perform this.callSave)}}
            data-test-save
          >
            <FaIcon
              @icon={{if this.callSave.isRunning "spinner" "check"}}
              @spin={{this.callSave.isRunning}}
            />
          </button>
          <button
            class="bigcancel"
            type="button"
            aria-label={{t "general.cancel"}}
            {{on "click" @cancel}}
            data-test-cancel
          >
            <FaIcon @icon="arrow-rotate-left" />
          </button>
        </div>
        <div class="content">
          <ul class="sortable-items">
            {{#each this.items as |item|}}
              <li
                class="item
                  {{if (eq this.draggingItem item) 'dragging-item'}}
                  {{if (eq this.draggedAboveItem item) 'dragged-above'}}
                  {{if (eq this.draggedBelowItem item) 'dragged-below'}}
                  "
                draggable="true"
                {{on "drag" (fn this.drag item)}}
                {{on "dragend" this.dragEnd}}
                {{on "dragover" (fn this.dragOver item)}}
              >
                <FaIcon @icon="up-down-left-right" />
                <span class="draggable-object-content">
                  <span class="title">
                    <LmTypeIcon
                      @type={{item.learningMaterial.type}}
                      @mimetype={{item.learningMaterial.mimetype}}
                    />
                    <span data-test-title>
                      {{item.learningMaterial.title}}
                    </span>
                  </span>
                  <span class="details">
                    {{capitalize item.learningMaterial.type}},
                    {{t "general.ownedBy" owner=item.learningMaterial.owningUser.fullName}},
                    {{t "general.status"}}:
                    {{item.learningMaterial.status.title}}
                  </span>
                </span>
              </li>
            {{/each}}
          </ul>
        </div>
      {{/if}}
    </div>
  </template>
}
