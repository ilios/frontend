import Ember from 'ember';
import DS from 'ember-data';
import { translationMacro as t } from "ember-i18n";

const { Component, computed, inject, RSVP, ObjectProxy } = Ember;
const { notEmpty, or, not } = computed;
const { service } = inject;
const { Promise } = RSVP;
const { PromiseArray } = DS;

export default Component.extend({
  currentUser: service(),
  store: service(),
  i18n: service(),
  tagName: 'section',
  classNameBindings: [':detail-learningmaterials', 'displaySearchBox'],
  subject: null,
  isCourse: false,
  editable: true,
  isManaging: or('isManagingMaterial', 'isManagingMesh'),
  isManagingMaterial: notEmpty('managingMaterial'),
  isManagingMesh: notEmpty('meshMaterial'),
  managingMaterial: null,
  meshMaterial: null,
  isSession: not('isCourse'),
  newButtonTitle: t('general.add'),
  bufferMaterial: null,
  bufferTerms: [],

  isEditing: false,
  type: null,

  displaySearchBox: computed('isManaging', 'isEditing', {
    get() {
      const isManaging = this.get('isManaging');
      const isEditing = this.get('isEditing');
      const editable = this.get('editable');

      return isManaging ? false : isEditing ? false : editable;
    }
  }).readOnly(),

  learningMaterialStatuses: computed(function(){
    var self = this;
    return PromiseArray.create({
      promise: self.get('store').findAll('learning-material-status')
    });
  }),
  learningMaterialUserRoles: computed(function(){
    var self = this;
    return PromiseArray.create({
      promise: self.get('store').findAll('learning-material-user-role')
    });
  }),
  proxyMaterials: computed('subject.learningMaterials.[]', function(){
    return new Promise(resolve => {
      let materialProxy = ObjectProxy.extend({
        sortTerms: ['name'],
        confirmRemoval: false,
        sortedDescriptors: computed.sort('content.meshDescriptors', 'sortTerms')
      });
      this.get('subject').get('learningMaterials').then(materials => {
        let sortedMaterials = materials.toArray().sort((lm1, lm2) => {
          let pos1 = lm1.get('position');
          let pos2 = lm2.get('position');
          if (pos1 > pos2) {
            return 1;
          } else if (pos1 < pos2) {
            return -1;
          }

          let id1 = lm1.get('id');
          let id2 = lm2.get('id');
          if (id1 > id2) {
            return -1;
          } else if (id1 < id2) {
            return 1;
          }
          return 0;
        });

        resolve(sortedMaterials.map(material => {
          return materialProxy.create({
            content: material
          });
        }));
      });
    });
  }),

  parentMaterials: computed('subject.learningMaterials.[]', function(){
    let defer = RSVP.defer();
    this.get('subject.learningMaterials').then(subLms => {
      let promises = [];
      let learningMaterials = [];
      subLms.forEach(lm => {
        promises.pushObject(lm.get('learningMaterial').then(learningMaterial => {
          learningMaterials.pushObject(learningMaterial);
        }));
      });
      RSVP.all(promises).then(()=>{
        defer.resolve(learningMaterials);
      });
    });
    return PromiseArray.create({
      promise: defer.promise
    });
  }),
  actions: {
    manageMaterial(learningMaterial){
      var buffer = Ember.Object.create();
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

        Ember.RSVP.all(promises).then(()=> {
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
        Ember.RSVP.all(promises).then(()=> {
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
            let position = learningMaterials.length + 1;
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
          });
          lmCollectionType = 'courseLearningMaterials';

        }
        if(this.get('isSession')){
          newLearningMaterial = this.get('store').createRecord('session-learning-material', {
            session: subject,
            learningMaterial: parentLearningMaterial,
          });
          lmCollectionType = 'sessionLearningMaterials';
        }
        subject.get('learningMaterials').then(learningMaterials => {
          newLearningMaterial.set('position', learningMaterials.length);
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
