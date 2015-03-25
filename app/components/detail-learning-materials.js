import Ember from 'ember';
import DS from 'ember-data';
export default Ember.Component.extend(Ember.I18n.TranslateableProperties, {
  subject: null,
  isCourse: false,
  isManaging: Ember.computed.notEmpty('managingMaterial'),
  managingMaterial: null,
  isSession: Ember.computed.not('isCourse'),
  materials: Ember.computed.alias('subject.learningMaterials'),
  newLearningMaterials: [],
  classNames: ['detail-learning-materials'],
  newButtonTitleTranslation: 'general.add',
  cancelBuffer: null,
  learningMaterialStatuses: function(){
    var self = this;
    return DS.PromiseArray.create({
      promise: self.store.find('learning-material-status')
    });
  }.property(),
  learningMaterialUserRoles: function(){
    var self = this;
    return DS.PromiseArray.create({
      promise: self.store.find('learning-material-user-role')
    });
  }.property(),
  actions: {
    manage: function(learningMaterial){
      var self = this;
      var buffer = {};
      buffer.publicNotes = learningMaterial.get('publicNotes');
      buffer.required = learningMaterial.get('required');
      learningMaterial.get('meshDescriptors').then(function(descriptors){
        buffer.descriptors = descriptors.toArray();
        learningMaterial.get('learningMaterial').then(function(parent){
          parent.get('status').then(function(status){
            buffer.status = status;
            self.set('cancelBuffer', buffer);
            self.set('managingMaterial', learningMaterial);
          });
        });
      });
    },
    save: function(){
      var self = this;
      var buffer = this.get('cancelBuffer');
      var learningMaterial = this.get('managingMaterial');
      learningMaterial.get('meshDescriptors').then(function(newDescriptors){
        let oldDescriptors = buffer.descriptors.filter(function(descriptor){
          return !newDescriptors.contains(descriptor);
        });
        if(self.get('isCourse')){
          oldDescriptors.forEach(function(descriptor){
            descriptor.get('courseLearningMaterials').removeObject(learningMaterial);
            descriptor.save();
          });
          newDescriptors.forEach(function(descriptor){
            descriptor.get('courseLearningMaterials').addObject(learningMaterial);
          });
        }
        if(self.get('isSession')){
          oldDescriptors.forEach(function(descriptor){
            descriptor.get('sessionLearningMaterials').removeObject(learningMaterial);
            descriptor.save();
          });
          newDescriptors.forEach(function(descriptor){
            descriptor.get('sessionLearningMaterials').addObject(learningMaterial);
          });
        }
        learningMaterial.get('learningMaterial').then(function(parent){
          parent.get('status').then(function(status){
            if(!buffer.status || status.get('id') !== buffer.status.get('id')){
              if(buffer.status){
                buffer.status.get('learningMaterials').then(function(lms){
                  lms.removeObject(parent);
                  buffer.status.save();
                });
              }
              status.get('learningMaterials').then(function(lms){
                lms.addObject(parent);
                status.save();
              });
              parent.save();
            }
            learningMaterial.save().then(function(){
              newDescriptors.save().then(function(){
                self.set('managingMaterial', null);
                self.set('cancelBuffer', null);
              });
            });
          });
        });

      });
    },
    cancel: function(){
      var self = this;
      var learningMaterial = this.get('managingMaterial');
      var buffer = this.get('cancelBuffer');
      learningMaterial.set('publicNotes', buffer.publicNotes);
      learningMaterial.set('required', buffer.required);
      learningMaterial.get('meshDescriptors').then(function(descriptors){
        descriptors.clear();
        descriptors.addObjects(buffer.descriptors);
        self.set('managingMaterial', null);
        self.set('cancelBuffer', null);
      });
      learningMaterial.get('learningMaterial').then(function(parent){
        parent.set('status', buffer.status);
      });
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
            var lm = self.store.createRecord('learning-material', {
              type: type,
              owningUser: self.get('currentUser.content'),
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
        subjectLm = this.store.createRecord('course-learning-material', {
          learningMaterial: lm,
          course: this.get('subject')
        });
        lmCollectionType = 'courseLearningMaterials';
      }
      if(this.get('isSession')){
        subjectLm = this.store.createRecord('session-learning-material', {
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
  }
});
