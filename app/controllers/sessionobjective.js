import Ember from 'ember';

export default Ember.ObjectController.extend(Ember.I18n.TranslateableProperties, {
  proxiedObjectives: [],
  session: null,
  course: null,
  actions: {
    addParent: function(parentProxy){
      var newParent = parentProxy.get('content');
      var sessionObjective = this.get('model');
      sessionObjective.get('parents').then(function(ourParents){
        ourParents.addObject(newParent);
        newParent.get('children').then(function(newParentChildren){
          newParentChildren.addObject(sessionObjective);
          newParent.save();
          sessionObjective.save();
        });
      });
    },
    removeParent: function(parentProxy){
      var removingParent = parentProxy.get('content');
      var sessionObjective = this.get('model');
      sessionObjective.get('parents').then(function(ourParents){
        ourParents.removeObject(removingParent);
        removingParent.get('children').then(function(children){
          children.removeObject(sessionObjective);
          removingParent.save();
          sessionObjective.save();
        });
      });
    }
  }
});
