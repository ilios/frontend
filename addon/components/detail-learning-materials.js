import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { dropTask, restartableTask } from 'ember-concurrency';
import { all } from 'rsvp';
import ObjectProxy from '@ember/object/proxy';
import sortableByPosition from 'ilios-common/utils/sortable-by-position';
import scrollIntoView from 'scroll-into-view';

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
  @tracked materialsRelationship;
  @tracked learningMaterialStatuses;
  @tracked learningMaterialUserRoles;
  @tracked title;

  constructor() {
    super(...arguments);
    this.learningMaterialStatuses = this.store.peekAll('learning-material-status');
    this.learningMaterialUserRoles = this.store.peekAll('learning-material-user-role');
  }

  load = restartableTask(async () => {
    this.materialsRelationship = await this.args.subject.learningMaterials;
  });

  get materials() {
    if (!this.materialsRelationship) {
      return [];
    }

    return this.materialsRelationship.toArray();
  }

  get parentMaterialIds() {
    return this.materials.map((lm) => {
      return lm.belongsTo('learningMaterial').id();
    });
  }

  get proxyMaterials() {
    const materialProxy = ObjectProxy.extend({ confirmRemoval: false });
    return this.materials
      .sort(sortableByPosition)
      .map((material) => materialProxy.create({ content: material }));
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

  confirmRemoval(lmProxy) {
    lmProxy.set('showRemoveConfirmation', true);
  }
  cancelRemove(lmProxy) {
    lmProxy.set('showRemoveConfirmation', false);
  }

  @action
  addNewLearningMaterial(type) {
    this.type = type;
    this.displayAddNewForm = true;
  }

  @action
  closeLearningmaterialManager() {
    this.managingMaterial = null;
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
      position = this.materials.sortBy('position').reverse()[0].get('position') + 1;
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
      position = this.materials.sortBy('position').reverse()[0].get('position') + 1;
    }
    newLearningMaterial.set('position', position);
    await newLearningMaterial.save();
  });

  remove = dropTask(async (lmProxy) => {
    const subjectLearningMaterial = lmProxy.get('content');
    subjectLearningMaterial.deleteRecord();
    return await subjectLearningMaterial.save();
  });

  async saveSomeMaterials(arr) {
    const chunk = arr.splice(0, 5);
    const savedMaterials = await all(chunk.invoke('save'));
    let moreMaterials = [];
    if (arr.length) {
      moreMaterials = await this.saveSomeMaterials(arr);
    }

    return [].concat(savedMaterials, moreMaterials);
  }
}
