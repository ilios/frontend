import Ember from 'ember';
import DS from 'ember-data';
export default Ember.Component.extend(Ember.I18n.TranslateableProperties, {
  subject: null,
  isCourse: false,
  isSession: Ember.computed.not('isCourse'),
  materials: Ember.computed.alias('subject.learningMaterials'),
  newLearningMaterials: [],
  classNames: ['detail-learning-materials'],
  newButtonTitleTranslation: 'general.add',
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
