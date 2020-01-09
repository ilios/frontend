import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { timeout } from 'ember-concurrency';
import { dropTask, restartableTask } from 'ember-concurrency-decorators';
import { map, all } from 'rsvp';
import ObjectProxy from '@ember/object/proxy';
import sortableByPosition from 'ilios-common/utils/sortable-by-position';

export default class DetailCohortsComponent extends Component {
  @service currentUser;
  @service store;
  @service intl;
  @tracked isSorting = false;
  @tracked managingMaterial = null;
  @tracked totalMaterialsToSave = null;
  @tracked currentMaterialsSaved = null;

  @tracked displayAddNewForm = false;
  @tracked type = null;
  @tracked materials = [];
  @tracked parentMaterials = null;
  @tracked learningMaterialStatuses = null;
  @tracked learningMaterialUserRoles = null;

  @restartableTask
  *load(event, [learningMaterials]) {
    if (!learningMaterials) {
      return;
    }

    this.materials = learningMaterials.toArray();

    this.parentMaterials = yield map(this.materials, async lm => {
      return await lm.get('learningMaterial');
    });

    this.learningMaterialStatuses = yield this.store.findAll('learning-material-status');
    this.learningMaterialUserRoles = yield this.store.findAll('learning-material-user-role');
  }

  get proxyMaterials() {
    const materialProxy = ObjectProxy.extend({ confirmRemoval: false });
    return this.materials
      .sort(sortableByPosition)
      .map(material => materialProxy.create({ content: material }));
  }

  get isManaging() {
    return !!this.managingMaterial;
  }

  get isSession() {
    return !this.args.isCourse;
  }
  get displaySearchBox(){
    return (!this.isManaging && !this.displayAddNewForm && !this.isSorting && this.args.editable);
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

  @dropTask
  *saveNewLearningMaterial(lm) {
    const savedLm = yield lm.save();

    let lmSubject;
    let position = 0;
    if (this.materials && this.materials.length) {
      position = this.materials.sortBy('position').reverse()[0].get('position') + 1;
    }
    if (this.args.isCourse) {
      lmSubject = this.store.createRecord('course-learning-material', {course: this.args.subject, position});
    } else {
      lmSubject = this.store.createRecord('session-learning-material', {session: this.args.subject, position});
    }
    lmSubject.set('learningMaterial', savedLm);
    yield lmSubject.save();
    this.displayAddNewForm = false;
    this.type = null;
  }

  @dropTask
  *saveSortOrder(learningMaterials) {
    yield timeout(1); //move out of the thread to allow the save indicator to show up
    for (let i = 0, n = learningMaterials.length; i < n; i++) {
      const lm = learningMaterials[i];
      lm.set('position', i + 1);
    }
    this.totalMaterialsToSave = learningMaterials.length;
    this.currentMaterialsSaved = 0;

    this.materials = yield this.saveSomeMaterials(learningMaterials);
    this.isSorting = false;
  }

  @dropTask
  *addLearningMaterial(parentLearningMaterial) {
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
        position: 0
      });
    }
    let position = 0;
    if (this.materials && this.materials.length > 1) {
      position = this.materials.sortBy('position').reverse()[0].get('position') + 1;
    }
    newLearningMaterial.set('position', position);
    yield newLearningMaterial.save();
  }

  @dropTask
  *remove(lmProxy) {
    const subjectLearningMaterial = lmProxy.get('content');
    subjectLearningMaterial.deleteRecord();
    return yield subjectLearningMaterial.save();
  }

  async saveSomeMaterials(arr){
    const chunk = arr.splice(0, 5);
    const savedMaterials = await all(chunk.invoke('save'));
    let moreMaterials = [];
    if (arr.length) {
      this.currentMaterialsSaved = this.currentMaterialsSaved + chunk.length;
      moreMaterials = await this.saveSomeMaterials(arr);
    }

    return [].concat(savedMaterials, moreMaterials);
  }
}
