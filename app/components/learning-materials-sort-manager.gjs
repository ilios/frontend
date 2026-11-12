import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import { faUpDownLeftRight } from '@fortawesome/free-solid-svg-icons';
import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import { task } from 'ember-concurrency';
import t from 'ember-intl/helpers/t';
import { eq } from 'ember-truth-helpers';

import capitalize from '../helpers/capitalize';
import sortableByPosition from '../utils/sortable-by-position';
import BigSaveCancelButtons from './big-save-cancel-buttons';
import LmTypeIcon from './lm-type-icon';

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
    return this.learningMaterials.value.toSorted(sortableByPosition);
  }

  get items() {
    return this.sortedItems ?? this.sortedLearningMaterials;
  }

  callSave = task({ drop: true }, async () => {
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
    <div class="sort-manager" data-test-detail-learning-materials-sort-manager>
      {{#if this.learningMaterials.isResolved}}
        <div class="actions">
          <BigSaveCancelButtons @save={{this.callSave}} @cancel={{@cancel}} />
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
                <FaIcon @icon={{faUpDownLeftRight}} />
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
