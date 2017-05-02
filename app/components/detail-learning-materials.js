import Ember from 'ember';
import { translationMacro as t } from "ember-i18n";
import SortableByPosition from 'ilios/mixins/sortable-by-position';

const { isEmpty, Component, computed, inject, RSVP, ObjectProxy, Object:EmberObject } = Ember;
const { notEmpty, or, not } = computed;
const { service } = inject;
const { all, Promise } = RSVP;

export default Component.extend(SortableByPosition, {
  currentUser: service(),
  store: service(),
  i18n: service(),
  tagName: 'section',
  classNameBindings: [':detail-learningmaterials', 'displaySearchBox'],
  subject: null,
  isCourse: false,
  editable: true,
  isSorting: false,
  isSaving: false,
  isManaging: or('isManagingMaterial', 'isManagingMesh'),
  isManagingMaterial: notEmpty('managingMaterial'),
  isManagingMesh: notEmpty('meshMaterial'),
  managingMaterial: null,
  meshMaterial: null,
  isSession: not('isCourse'),
  newButtonTitle: t('general.add'),
  bufferMaterial: null,
  bufferTerms: [],
  totalMaterialsToSave: null,
  currentMaterialsSaved: null,

  isEditing: false,
  type: null,

  displaySearchBox: computed('isManaging', 'isEditing', 'isSorting', {
    get() {
      const isManaging = this.get('isManaging');
      const isEditing = this.get('isEditing');
      const editable = this.get('editable');
      const isSorting = this.get('isSorting');

      return (!isManaging && !isEditing && !isSorting && editable);
    }
  }).readOnly(),

  learningMaterialStatuses: computed(function() {
    return new Promise(resolve => {
      this.get('store').findAll('learning-material-status').then(statuses => {
        resolve(statuses);
      });
    });
  }),

  learningMaterialUserRoles: computed(function() {
    return new Promise(resolve => {
      this.get('store').findAll('learning-material-user-role').then(roles => {
        resolve(roles);
      });
    });
  }),

  proxyMaterials: computed('subject.learningMaterials.@each.{position}', function(){
    return new Promise(resolve => {
      let materialProxy = ObjectProxy.extend({
        sortTerms: ['name'],
        confirmRemoval: false,
        sortedDescriptors: computed.sort('content.meshDescriptors', 'sortTerms')
      });
      this.get('subject').get('learningMaterials').then(materials => {
        let sortedMaterials = materials.toArray().sort(this.positionSortingCallback);
        resolve(sortedMaterials.map(material => {
          return materialProxy.create({
            content: material
          });
        }));
      });
    });
  }),

  parentMaterials: computed('subject.learningMaterials.[]', function(){
    return new Promise(resolve => {
      this.get('subject.learningMaterials').then(subLms => {
        let promises = [];
        let learningMaterials = [];
        subLms.forEach(lm => {
          promises.pushObject(lm.get('learningMaterial').then(learningMaterial => {
            learningMaterials.pushObject(learningMaterial);
          }));
        });
        all(promises).then(()=>{
          resolve(learningMaterials);
        });
      });
    });
  }),

  hasMoreThanOneLearningMaterial: computed('subject.learningMaterials.[]', function() {
    return new Promise(resolve => {
      this.get('subject').get('learningMaterials').then(materials => {
        resolve(materials.length > 1);
      });
    });
  }),

  saveSomeMaterials(arr){
    let chunk = arr.splice(0, 5);
    return all(chunk.invoke('save')).then(() => {
      if (arr.length){
        this.set('currentMaterialsSaved', this.get('currentMaterialsSaved') + chunk.length);
        return this.saveSomeMaterials(arr);
      }
    });
  },

  actions: {
    manageMaterial(learningMaterial){
      let buffer = EmberObject.create();
      buffer.set('publicNotes', learningMaterial.get('publicNotes'));
      buffer.set('required', learningMaterial.get('required'));
      buffer.set('notes', learningMaterial.get('notes'));
      learningMaterial.get('learningMaterial').then( parent => {
        parent.get('status').then(status => {
          buffer.set('status',status);
          this.set('bufferMaterial', buffer);
          this.set('managingMaterial', learningMaterial);
        });
      });
    },
    manageDescriptors(learningMaterial){
      learningMaterial.get('meshDescriptors').then(descriptors => {
        this.set('bufferTerms', descriptors.toArray());
        this.set('meshMaterial', learningMaterial);
      });
    },
    save(){
      if(this.get('isManagingMaterial')){
        let buffer = this.get('bufferMaterial');
        let learningMaterial = this.get('managingMaterial');
        let promises = [];
        learningMaterial.set('publicNotes', buffer.get('publicNotes'));
        learningMaterial.set('required', buffer.get('required'));
        learningMaterial.set('notes', buffer.get('notes'));
        promises.pushObject(learningMaterial.save());
        promises.pushObject(learningMaterial.get('learningMaterial').then( parent => {
          parent.set('status', buffer.get('status'));
          promises.pushObject(parent.save());
        }));

        all(promises).then(()=> {
          this.set('bufferMaterial', null);
          this.set('managingMaterial', null);
        });
      }

      if(this.get('isManagingMesh')){
        let lm = this.get('meshMaterial');
        let terms = lm .get('meshDescriptors');
        let promises = [];

        let oldTerms = terms.filter(term => {
          return !this.get('bufferTerms').includes(term);
        });
        terms.clear();
        terms.addObjects(this.get('bufferTerms'));
        this.get('bufferTerms').forEach((term)=>{
          if(this.get('isCourse')){
            term.get('courseLearningMaterials').pushObject(lm);
          }
          if(this.get('isSession')){
            term.get('sessionLearningMaterials').pushObject(lm);
          }
        });
        oldTerms.forEach(term => {
          if(this.get('isCourse')){
            term.get('courseLearningMaterials').removeObject(lm);
          }
          if(this.get('isSession')){
            term.get('sessionLearningMaterials').removeObject(lm);
          }
        });
        promises.pushObject(lm.save());
        all(promises).then(()=> {
          this.set('meshMaterial', null);
          this.set('bufferTerms', []);
        });
      }
    },

    cancel() {
      this.setProperties({ bufferMaterial: null, managingMaterial: null, bufferTerms: [], meshMaterial: null });
    },

    addNewLearningMaterial(type){
      this.setProperties({ type, isEditing: true });
    },

    saveNewLearningMaterial(lm) {
      return new Promise(resolve => {
        const store = this.get('store');
        const isCourse = this.get('isCourse');
        const subject = this.get('subject');
        lm.save().then((savedLm) => {
          subject.get('learningMaterials').then(learningMaterials => {
            let lmSubject;
            let position = 0;
            if (! isEmpty(learningMaterials)) {
              position = learningMaterials.toArray().sortBy('position').reverse()[0].get('position') + 1;
            }
            if (isCourse) {
              lmSubject = store.createRecord('course-learning-material', { course: subject, position });
            } else {
              lmSubject = store.createRecord('session-learning-material', { session: subject, position });
            }
            lmSubject.set('learningMaterial', savedLm);
            lmSubject.save().then(() => {
              this.set('isEditing', false);
              resolve();
            });
          });
        });
      });
    },

    saveSortOrder(learningMaterials){
      this.set('isSaving', true);
      for (let i = 0, n = learningMaterials.length; i < n; i++) {
        let lm = learningMaterials[i];
        lm.set('position', i + 1);
      }
      this.set('totalMaterialsToSave', learningMaterials.length);
      this.set('currentMaterialsSaved', 0);

      this.saveSomeMaterials(learningMaterials).then(() => {
        this.set('isSaving', false);
        this.set('isSorting', false);
      });
    },

    cancelSorting() {
      this.set('isSorting', false);
    },

    cancelNewLearningMaterial() {
      this.set('isEditing', false);
    },

    addTermToBuffer(term){
      this.get('bufferTerms').addObject(term);
    },
    removeTermFromBuffer(term){
      this.get('bufferTerms').removeObject(term);
    },
    changeStatus(newStatus){
      this.get('bufferMaterial').set('status', newStatus);
    },
    changeRequired(value){
      this.get('bufferMaterial').set('required', value);
    },
    changePublicNotes(value){
      this.get('bufferMaterial').set('publicNotes', value);
    },
    changeNotes(value){
      this.get('bufferMaterial').set('notes', value);
    },
    addLearningMaterial(parentLearningMaterial){
      return new Promise(resolve => {
        let newLearningMaterial;
        let lmCollectionType;
        let subject = this.get('subject');

        if(this.get('isCourse')){
          newLearningMaterial = this.get('store').createRecord('course-learning-material', {
            course: subject,
            learningMaterial: parentLearningMaterial,
            position: 0,
          });
          lmCollectionType = 'courseLearningMaterials';

        }
        if(this.get('isSession')){
          newLearningMaterial = this.get('store').createRecord('session-learning-material', {
            session: subject,
            learningMaterial: parentLearningMaterial,
            position: 0
          });
          lmCollectionType = 'sessionLearningMaterials';
        }
        subject.get('learningMaterials').then(learningMaterials => {
          let position = 0;
          if (learningMaterials.length > 1) {
            position = learningMaterials.toArray().sortBy('position').reverse()[0].get('position') + 1;
          }
          newLearningMaterial.set('position', position);
          newLearningMaterial.save().then(savedLearningMaterial => {
            parentLearningMaterial.get(lmCollectionType).then(children => {
              children.pushObject(savedLearningMaterial);
              resolve(savedLearningMaterial);
            });
          });
        });
      });
    },
    confirmRemoval(lmProxy){
      lmProxy.set('showRemoveConfirmation', true);
    },
    cancelRemove(lmProxy){
      lmProxy.set('showRemoveConfirmation', false);
    },
    remove(lmProxy){
      let subjectLearningMaterial = lmProxy.get('content');
      let lmCollectionType;
      if(this.get('isCourse')){
        lmCollectionType = 'courseLearningMaterials';
      }
      if(this.get('isSession')){
        lmCollectionType = 'sessionLearningMaterials';
      }
      this.get('subject').get('learningMaterials').then(lms => {
        subjectLearningMaterial.get('learningMaterial').then(parentLearningMaterial => {
          parentLearningMaterial.get(lmCollectionType).then(children => {
            children.removeObject(subjectLearningMaterial);
            lms.removeObject(subjectLearningMaterial);
            subjectLearningMaterial.deleteRecord();
            subjectLearningMaterial.save();
          });
        });
      });
    },
  }
});
