import Ember from 'ember';
import DS from 'ember-data';
export default Ember.Component.extend(Ember.I18n.TranslateableProperties, {
  currentUser: Ember.inject.service(),
  store: Ember.inject.service(),
  subject: null,
  isCourse: false,
  isManaging: Ember.computed.or('isManagingMaterial', 'isManagingMesh'),
  isManagingMaterial: Ember.computed.notEmpty('managingMaterial'),
  isManagingMesh: Ember.computed.notEmpty('meshMaterial'),
  managingMaterial: null,
  meshMaterial: null,
  isSession: Ember.computed.not('isCourse'),
  materials: Ember.computed.alias('subject.learningMaterials'),
  newLearningMaterials: [],
  classNames: ['detail-learning-materials'],
  newButtonTitleTranslation: 'general.add',
  bufferMaterial: null,
  bufferTerms: [],
  learningMaterialStatuses: function(){
    var self = this;
    return DS.PromiseArray.create({
      promise: self.get('store').find('learning-material-status')
    });
  }.property(),
  learningMaterialUserRoles: function(){
    var self = this;
    return DS.PromiseArray.create({
      promise: self.get('store').find('learning-material-user-role')
    });
  }.property(),
  proxyMaterials: Ember.computed('materials.@each', function(){
    let materialProxy = Ember.ObjectProxy.extend({
      sortTerms: ['title'],
      sortedDescriptors: Ember.computed.sort('content.meshDescriptors', 'sortTerms')
    });
    return this.get('materials').map(material => {
      return materialProxy.create({
        content: material
      });
    });
  }),
  actions: {
    manageMaterial: function(learningMaterial){
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
    manageDescriptors: function(learningMaterial){
      learningMaterial.get('meshDescriptors').then(descriptors => {
        this.set('bufferTerms', descriptors.toArray());
        this.set('meshMaterial', learningMaterial);
      });
    },
    save: function(){
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
            promises.pushObject(term.save());
          }
          if(this.get('isSession')){
            term.get('sessionLearningMaterials').pushObject(lm);
            promises.pushObject(term.save());
          }
        });
        oldTerms.forEach(term => {
          if(this.get('isCourse')){
            term.get('courseLearningMaterials').removeObject(lm);
            promises.pushObject(term.save());
          }
          if(this.get('isSession')){
            term.get('sessionLearningMaterials').removeObject(lm);
            promises.pushObject(term.save());
          }
        });
        promises.pushObject(lm.save());
        Ember.RSVP.all(promises).then(()=> {
          this.set('meshMaterial', null);
          this.set('bufferTerms', []);
        });
      }
    },
    cancel: function(){
      this.set('bufferMaterial', null);
      this.set('managingMaterial', null);
      this.set('bufferTerms', []);
      this.set('meshMaterial', null);

    },
    addNewLearningMaterial: function(type){
      var self = this;
      if(type === 'file' || type === 'citation' || type === 'link'){
        this.get('learningMaterialStatuses').then(function(statuses){
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
    saveNewLearningMaterial: function(lm){
      var self = this;
      var subjectLm;
      var lmCollectionType;
      self.get('newLearningMaterials').removeObject(lm);
      if(this.get('isCourse')){
        subjectLm = this.get('store').createRecord('course-learning-material', {
          learningMaterial: lm,
          course: this.get('subject')
        });
        lmCollectionType = 'courseLearningMaterials';
      }
      if(this.get('isSession')){
        subjectLm = this.get('store').createRecord('session-learning-material', {
          learningMaterial: lm,
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
            lms.save();
            lm.save();
          });
        });
      });
    },
    removeNewLearningMaterial: function(lm){
      this.get('newLearningMaterials').removeObject(lm);
    },
    addTermToBuffer: function(term){
      this.get('bufferTerms').addObject(term);
    },
    removeTermFromBuffer: function(term){
      this.get('bufferTerms').removeObject(term);
    },
    changeStatus: function(newStatus){
      this.get('bufferMaterial').set('status', newStatus);
    },
    changeRequired: function(value){
      this.get('bufferMaterial').set('required', value);
    },
    changePublicNotes: function(value){
      this.get('bufferMaterial').set('publicNotes', value);
    },
    changeNotes: function(value){
      this.get('bufferMaterial').set('notes', value);
    }
  },
});
