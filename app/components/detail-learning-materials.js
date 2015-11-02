import Ember from 'ember';
import DS from 'ember-data';
import { translationMacro as t } from "ember-i18n";

const {computed, inject, RSVP} = Ember;
const {notEmpty, or, not} = computed;
const {service} = inject;
const {PromiseArray} = DS;

export default Ember.Component.extend({
  currentUser: service(),
  store: service(),
  i18n: service(),
  subject: null,
  isCourse: false,
  isManaging: or('isManagingMaterial', 'isManagingMesh'),
  isManagingMaterial: notEmpty('managingMaterial'),
  isManagingMesh: notEmpty('meshMaterial'),
  managingMaterial: null,
  meshMaterial: null,
  isSession: not('isCourse'),
  newLearningMaterials: [],
  classNames: ['detail-learning-materials'],
  newButtonTitle: t('general.add'),
  bufferMaterial: null,
  bufferTerms: [],
  learningMaterialStatuses: function(){
    var self = this;
    return PromiseArray.create({
      promise: self.get('store').findAll('learning-material-status')
    });
  }.property(),
  learningMaterialUserRoles: computed(function(){
    var self = this;
    return PromiseArray.create({
      promise: self.get('store').findAll('learning-material-user-role')
    });
  }),
  proxyMaterials: computed('subject.learningMaterials.[]', function(){
    let materialProxy = Ember.ObjectProxy.extend({
      sortTerms: ['name'],
      confirmRemoval: false,
      sortedDescriptors: Ember.computed.sort('content.meshDescriptors', 'sortTerms')
    });
    return this.get('subject.learningMaterials').map(material => {
      return materialProxy.create({
        content: material
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
          return !this.get('bufferTerms').contains(term);
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
    cancel(){
      this.set('bufferMaterial', null);
      this.set('managingMaterial', null);
      this.set('bufferTerms', []);
      this.set('meshMaterial', null);

    },
    addNewLearningMaterial(type){
      var self = this;
      if(type === 'file' || type === 'citation' || type === 'link'){
        self.get('learningMaterialStatuses').then(function(statuses){
          self.get('learningMaterialUserRoles').then(function(roles){
            //default the status to Final if that status exists
            var defaultStatus = statuses.find(function(status){
              return status.get('title') === 'Final';
            });
            if(!defaultStatus){
              defaultStatus = statuses.get('firstObject');
            }
            var lm = self.get('store').createRecord('learning-material', {
              type: type,
              owningUser: self.get('currentUser.model'),
              status: defaultStatus,
              userRole: roles.get('firstObject'),
            });
            self.get('newLearningMaterials').addObject(lm);
          });
        });
      }
    },
    saveNewLearningMaterial(lm){
      var self = this;
      var subjectLm;
      var lmCollectionType;
      self.get('newLearningMaterials').removeObject(lm);
      if(this.get('isCourse')){
        subjectLm = this.get('store').createRecord('course-learning-material', {
          course: this.get('subject')
        });
        lmCollectionType = 'courseLearningMaterials';
      }
      if(this.get('isSession')){
        subjectLm = this.get('store').createRecord('session-learning-material', {
          session: this.get('subject')
        });
        lmCollectionType = 'sessionLearningMaterials';
      }
      lm.save().then(function(savedLm){
        subjectLm.set('learningMaterial', savedLm);
        subjectLm.save().then(function(savedSubjectLm){
          lm.get(lmCollectionType).then(function(collection){
            collection.addObject(savedSubjectLm);
          });

          self.get('subject.learningMaterials').then(function(lms){
            lms.addObject(savedSubjectLm);
          });
        });
      });
    },
    removeNewLearningMaterial(lm){
      this.get('newLearningMaterials').removeObject(lm);
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
      let newLearningMaterial;
      let lmCollectionType;
      if(this.get('isCourse')){
        newLearningMaterial = this.get('store').createRecord('course-learning-material', {
          course: this.get('subject'),
          learningMaterial: parentLearningMaterial
        });
        lmCollectionType = 'courseLearningMaterials';
      }
      if(this.get('isSession')){
        newLearningMaterial = this.get('store').createRecord('session-learning-material', {
          session: this.get('subject'),
          learningMaterial: parentLearningMaterial
        });
        lmCollectionType = 'sessionLearningMaterials';
      }
      newLearningMaterial.save().then(savedLearningMaterial => {
        parentLearningMaterial.get(lmCollectionType).then(children => {
          children.pushObject(savedLearningMaterial);
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
