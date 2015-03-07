import Ember from 'ember';

export default Ember.Component.extend({
  subject: null,
  isCourse: false,
  isSession: Ember.computed.not('isCourse'),
  isManagingParents: Ember.computed.notEmpty('currentlyManagedObjective'),
  currentlyManagedObjective: null,
  initialParentsForCurrentlyManagedObjective: [],
  actions: {
    manageParents: function(objective){
      let self = this;
      objective.get('parents').then(function(parents){
        self.set('initialParentsForCurrentlyManagedObjective', parents.toArray());
        self.set('currentlyManagedObjective', objective);
      });
    },
    save: function(){
      var self = this;
      let objective = this.get('currentlyManagedObjective');
      objective.get('parents').then(function(newParents){
        var oldParents = self.get('initialParentsForCurrentlyManagedObjective').filter(function(parent){
          return newParents.contains(parent);
        });
        oldParents.forEach(function(parent){
          parent.get('children').removeObject(objective);
          parent.save();
        });
        objective.save();
        objective.get('parents').then(function(parents){
          parents.save();
          self.set('currentlyManagedObjective', null);
        });

      });
    },
    cancel: function(){
      var self = this;
      let objective = this.get('currentlyManagedObjective');
      let parents = objective.get('parents');
      parents.clear();
      parents.addObjects(this.get('initialParentsForCurrentlyManagedObjective'));
      self.set('currentlyManagedObjective', null);
    }
  }
});
