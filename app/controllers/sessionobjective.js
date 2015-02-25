import Ember from 'ember';

export default Ember.ObjectController.extend(Ember.I18n.TranslateableProperties, {
  proxiedObjectives: [],
  session: null,
  course: null,
  actions: {
    addParent: function(parentProxy){
      var newParent = parentProxy.get('content');
      var self = this;
      var sessionObjective = this.get('model');
      sessionObjective.get('parents').then(function(ourParents){
        newParent.get('children').then(function(newParentChildren){
          newParentChildren.addObject(sessionObjective);
          newParent.save().then(function(newParent){
            ourParents.addObject(newParent);
            sessionObjective.save().then(function(sessionObjective){
              self.set('model', sessionObjective);
            });
          });
        });
      });
    },
    removeParent: function(parentProxy){
      var self = this;
      var removingParent = parentProxy.get('content');
      var sessionObjective = this.get('model');
      sessionObjective.get('parents').then(function(ourParents){
        ourParents.removeObject(removingParent);
        removingParent.get('children').then(function(children){
          children.addObject(sessionObjective);
          sessionObjective.save().then(function(sessionObjective){
            self.set('model', sessionObjective);
            removingParent.save();
          });
        });
      });
    }
  }
});
