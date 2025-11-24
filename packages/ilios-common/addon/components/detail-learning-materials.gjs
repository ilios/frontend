import Component from '@glimmer/component';
import { service } from '@ember/service';
import { cached, tracked } from '@glimmer/tracking';
import { guidFor } from '@ember/object/internals';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { all } from 'rsvp';
import { TrackedAsyncData } from 'ember-async-data';
import { mapBy } from 'ilios-common/utils/array-helpers';
import scrollIntoView from 'ilios-common/utils/scroll-into-view';
import sortableByPosition from 'ilios-common/utils/sortable-by-position';
import t from 'ember-intl/helpers/t';
import LearningmaterialSearch from 'ilios-common/components/learningmaterial-search';
import perform from 'ember-concurrency/helpers/perform';
import { on } from '@ember/modifier';
import { fn, array } from '@ember/helper';
import FaIcon from 'ilios-common/components/fa-icon';
import and from 'ember-truth-helpers/helpers/and';
import not from 'ember-truth-helpers/helpers/not';
import ChooseMaterialType from 'ilios-common/components/choose-material-type';
import LearningmaterialManager from 'ilios-common/components/learningmaterial-manager';
import LearningMaterialsSortManager from 'ilios-common/components/learning-materials-sort-manager';
import set from 'ember-set-helper/helpers/set';
import NewLearningmaterial from 'ilios-common/components/new-learningmaterial';
import gt from 'ember-truth-helpers/helpers/gt';
import DetailLearningMaterialsItem from 'ilios-common/components/detail-learning-materials-item';

export default class DetailCohortsComponent extends Component {
  @service currentUser;
  @service store;
  @service intl;
  @tracked isSorting = false;
  @tracked managingMaterial;
  @tracked totalMaterialsToSave;
  @tracked currentMaterialsSaved;
  @tracked displayAddNewForm = false;
  @tracked type;
  @tracked learningMaterialStatuses;
  @tracked learningMaterialUserRoles;

  @cached
  get lmData() {
    return new TrackedAsyncData(this.args.subject.learningMaterials);
  }

  constructor() {
    super(...arguments);
    this.learningMaterialStatuses = this.store.peekAll('learning-material-status');
    this.learningMaterialUserRoles = this.store.peekAll('learning-material-user-role');
  }

  get titleId() {
    return `detail-learning-materials-header-${guidFor(this)}`;
  }

  get title() {
    return document.getElementById(this.titleId);
  }

  @cached
  get materials() {
    if (!this.lmData.isResolved) {
      return [];
    }
    return this.lmData.value.slice().sort(sortableByPosition);
  }

  get parentMaterialIds() {
    return this.materials.map((lm) => {
      return lm.belongsTo('learningMaterial').id();
    });
  }

  get isManaging() {
    return !!this.managingMaterial;
  }

  get isSession() {
    return !this.args.isCourse;
  }
  get displaySearchBox() {
    return !this.isManaging && !this.displayAddNewForm && !this.isSorting && this.args.editable;
  }

  get hasMoreThanOneLearningMaterial() {
    return this.materials && this.materials.length > 1;
  }

  @action
  setManagedMaterial(lm) {
    this.managingMaterial = lm;
  }

  @action
  addNewLearningMaterial(type) {
    this.type = type;
    this.displayAddNewForm = true;
  }

  @action
  closeLearningmaterialManager() {
    this.setManagedMaterial(null);
    scrollIntoView(this.title);
  }

  @action
  closeNewLearningmaterial() {
    this.displayAddNewForm = false;
    scrollIntoView(this.title);
  }

  saveNewLearningMaterial = task({ drop: true }, async (lm) => {
    const savedLm = await lm.save();

    let lmSubject;
    let position = 0;
    if (this.materials && this.materials.length) {
      const positions = mapBy(this.materials, 'position');
      position = Math.max(...positions) + 1;
    }
    if (this.args.isCourse) {
      lmSubject = this.store.createRecord('course-learning-material', {
        course: this.args.subject,
        position,
      });
    } else {
      lmSubject = this.store.createRecord('session-learning-material', {
        session: this.args.subject,
        position,
      });
    }
    lmSubject.set('learningMaterial', savedLm);
    await lmSubject.save();
    this.displayAddNewForm = false;
    this.type = null;
    scrollIntoView(this.title);
  });

  saveSortOrder = task({ drop: true }, async (learningMaterials) => {
    const materialsToSave = [];
    for (let i = 0, n = learningMaterials.length; i < n; i++) {
      const lm = learningMaterials[i];
      const position = i + 1;
      if (lm.position != position) {
        lm.set('position', position);
        materialsToSave.push(lm);
      }
    }

    await this.saveSomeMaterials(materialsToSave);
    this.isSorting = false;
    scrollIntoView(this.title);
  });

  addLearningMaterial = task({ drop: true }, async (parentLearningMaterial) => {
    let newLearningMaterial;

    if (this.args.isCourse) {
      newLearningMaterial = this.store.createRecord('course-learning-material', {
        course: this.args.subject,
        learningMaterial: parentLearningMaterial,
        position: 0,
      });
    } else {
      newLearningMaterial = this.store.createRecord('session-learning-material', {
        session: this.args.subject,
        learningMaterial: parentLearningMaterial,
        position: 0,
      });
    }
    let position = 0;
    if (this.materials && this.materials.length > 1) {
      const positions = mapBy(this.materials, 'position');
      position = Math.max(...positions) + 1;
    }
    newLearningMaterial.set('position', position);
    await newLearningMaterial.save();
  });

  remove = task({ drop: true }, async (lm) => {
    lm.deleteRecord();
    return await lm.save();
  });

  async saveSomeMaterials(arr) {
    const chunk = arr.splice(0, 5);
    const savedMaterials = await all(chunk.map((o) => o.save()));
    let moreMaterials = [];
    if (arr.length) {
      moreMaterials = await this.saveSomeMaterials(arr);
    }

    return [].concat(savedMaterials, moreMaterials);
  }
  <template>
    <section
      class="detail-learningmaterials{{if this.displaySearchBox ' display-search-box'}}"
      data-test-detail-learning-materials
    >
      <div class="detail-learningmaterials-header">
        <div class="title" id={{this.titleId}}>
          {{#if this.isManaging}}
            <span class="specific-title">
              {{t "general.learningMaterialManageTitle"}}
            </span>
          {{else}}
            {{t "general.learningMaterials"}}
            ({{@subject.learningMaterials.length}})
          {{/if}}
        </div>
        {{#if this.displaySearchBox}}
          <LearningmaterialSearch
            @add={{perform this.addLearningMaterial}}
            @currentMaterialIds={{this.parentMaterialIds}}
          />
        {{/if}}
        <div class="detail-learningmaterials-actions">
          {{#if this.displayAddNewForm}}
            <button
              class="collapse-button"
              type="button"
              aria-label={{t "general.cancel"}}
              {{on "click" (fn (mut this.displayAddNewForm) false)}}
            >
              <FaIcon @icon="minus" />
            </button>
          {{else if (and @editable (not this.isSorting) (not this.isManaging))}}
            <ChooseMaterialType
              @choose={{this.addNewLearningMaterial}}
              @types={{array "file" "link" "citation"}}
            />
          {{/if}}
        </div>
      </div>
      <div class="detail-learningmaterials-content">
        {{#if this.isManaging}}
          <LearningmaterialManager
            @learningMaterial={{this.managingMaterial}}
            @editable={{@editable}}
            @closeManager={{this.closeLearningmaterialManager}}
            @learningMaterialStatuses={{this.learningMaterialStatuses}}
          />
        {{else if this.isSorting}}
          <LearningMaterialsSortManager
            @save={{perform this.saveSortOrder}}
            @cancel={{fn (set this "isSorting") false}}
            @subject={{@subject}}
          />
        {{else if this.displayAddNewForm}}
          <NewLearningmaterial
            @type={{this.type}}
            @learningMaterialStatuses={{this.learningMaterialStatuses}}
            @learningMaterialUserRoles={{this.learningMaterialUserRoles}}
            @save={{perform this.saveNewLearningMaterial}}
            @cancel={{this.closeNewLearningmaterial}}
          />
        {{else if this.materials.length}}
          {{#if (and @editable this.hasMoreThanOneLearningMaterial)}}
            <button
              class="sort-materials-btn"
              type="button"
              {{on "click" (fn (mut this.isSorting) true)}}
              data-test-sort-button
            >
              {{t "general.sortMaterials"}}
            </button>
          {{/if}}
          <table
            class="ilios-table ilios-zebra-table{{if
                (gt this.materials.length 10)
                ' sticky-header'
              }}"
          >
            <thead>
              <tr>
                <th class="text-left" colspan="3">
                  {{t "general.displayName"}}
                </th>
                <th class="text-center" colspan="2">
                  {{t "general.owner"}}
                </th>
                <th class="text-center" colspan="2">
                  {{t "general.required"}}
                </th>
                <th class="text-center" colspan="2">
                  {{t "general.notes"}}
                </th>
                <th class="text-center" colspan="2">
                  {{t "general.mesh"}}
                </th>
                <th class="text-center" colspan="2">
                  {{t "general.status"}}
                </th>
                <th class="text-left" colspan="1">
                  {{t "general.actions"}}
                </th>
              </tr>
            </thead>
            <tbody>
              {{#each this.materials as |lm|}}
                <DetailLearningMaterialsItem
                  @editable={{@editable}}
                  @lm={{lm}}
                  @setManagedMaterial={{this.setManagedMaterial}}
                  @remove={{this.remove}}
                />
              {{/each}}
            </tbody>
          </table>
        {{/if}}
      </div>
    </section>
  </template>
}
