import Ember from 'ember';

export default Ember.ObjectController.extend(Ember.I18n.TranslateableProperties, {
  objectiveTitleTranslation: 'courses.objectiveTitle',
  objectiveParentTitleTranslation: 'courses.objectiveParentTitle',
  groupTitleTranslation: 'courses.chooseCohortTitle',
  missingCohortMessageTranslation: 'courses.missingCohortMessage',
  objectiveGroups: [],
  course: null,
  actions: {
    addParent: function(parentProxy){
      var newParent = parentProxy.get('content');
      var self = this;
      var courseObjective = this.get('model');
      courseObjective.get('parents').then(function(ourParents){
        newParent.get('children').then(function(newParentChildren){
          ourParents.forEach(function(aParent){
            aParent.get('children').removeObject(courseObjective);
            aParent.save();
          });
          newParentChildren.addObject(courseObjective);
          newParent.save().then(function(newParent){
            ourParents.addObject(newParent);
            courseObjective.save().then(function(){
              self.transitionToRoute('course', self.get('course'), {queryParams: {details: true}});
            });
          });
        });
      });
    },
    removeParent: function(){
      var self = this;
      var courseObjective = this.get('model');
      courseObjective.get('parents').then(function(ourParents){
        ourParents.forEach(function(aParent){
          aParent.get('children').removeObject(courseObjective);
          aParent.save();
        });
        courseObjective.save().then(function(){
          self.transitionToRoute('course', self.get('course'), {queryParams: {details: true}});
        });
      });
    }
  }
});
