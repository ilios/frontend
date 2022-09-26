import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { dropTask } from 'ember-concurrency';
import { all } from 'rsvp';
import scrollIntoView from 'scroll-into-view';
import { use } from 'ember-could-get-used-to-this';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';
import { mapBy } from 'ilios-common/utils/array-helpers';
import sortableByPosition from 'ilios-common/utils/sortable-by-position';

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
  @tracked title;

  @use lmResource = new ResolveAsyncValue(() => [this.args.subject.learningMaterials]);

  constructor() {
    super(...arguments);
    this.learningMaterialStatuses = this.store.peekAll('learning-material-status').slice();
    this.learningMaterialUserRoles = this.store.peekAll('learning-material-user-role').slice();
  }

  get materials() {
    if (!this.lmResource) {
      return [];
    }
    return this.lmResource.slice().sort(sortableByPosition);
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
    scrollIntoView(this.title, {
      align: { top: 0 },
    });
  }

  @action
  closeNewLearningmaterial() {
    this.displayAddNewForm = false;
    scrollIntoView(this.title, {
      align: { top: 0 },
    });
  }

  saveNewLearningMaterial = dropTask(async (lm) => {
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
    scrollIntoView(this.title, {
      align: { top: 0 },
    });
  });

  saveSortOrder = dropTask(async (learningMaterials) => {
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
    scrollIntoView(this.title, {
      align: { top: 0 },
    });
  });

  addLearningMaterial = dropTask(async (parentLearningMaterial) => {
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

  remove = dropTask(async (lm) => {
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
}
