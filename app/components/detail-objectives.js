import Ember from 'ember';

export default Ember.Component.extend({
  subject: null,
  classNames: ['detail-objectives'],
  isCourse: false,
  isSession: Ember.computed.not('isCourse'),
  isManaging: Ember.computed.or('isManagingParents', 'isManagingDescriptors'),
  isManagingParents: Ember.computed.notEmpty('mangeParentsObjective'),
  mangeParentsObjective: null,
  initialStateForManageParentsObjective: [],
  isManagingDescriptors: Ember.computed.notEmpty('manageDescriptorsObjective'),
  mangeMeshObjective: null,
  initialStateForManageMeshObjective: [],
  actions: {
    manageParents: function(objective){
      let self = this;
      objective.get('parents').then(function(parents){
        self.set('initialStateForManageParentsObjective', parents.toArray());
        self.set('mangeParentsObjective', objective);
      });
    },
    manageDescriptors: function(objective){
      let self = this;
      objective.get('meshDescriptors').then(function(descriptors){
        self.set('initialStateForManageMeshObjective', descriptors.toArray());
        self.set('manageDescriptorsObjective', objective);
      });
    },
    save: function(){
      var self = this;
      if(this.get('isManagingParents')){
        let objective = this.get('mangeParentsObjective');
        objective.get('parents').then(function(newParents){
          let oldParents = self.get('initialStateForManageParentsObjective').filter(function(parent){
            return !newParents.contains(parent);
          });
          oldParents.forEach(function(parent){
            parent.get('children').removeObject(objective);
            parent.save();
          });
          objective.save().then(function(){
            newParents.save().then(function(){
              self.set('mangeParentsObjective', null);
            });
          });
        });
      }
      if(this.get('isManagingDescriptors')){
        let objective = this.get('manageDescriptorsObjective');
        objective.get('meshDescriptors').then(function(newDescriptors){
          let oldDescriptors = self.get('initialStateForManageMeshObjective').filter(function(descriptor){
            return !newDescriptors.contains(descriptor);
          });
          oldDescriptors.forEach(function(descriptor){
            descriptor.get('objectives').removeObject(objective);
            descriptor.save();
          });
          newDescriptors.forEach(function(descriptor){
            descriptor.get('objectives').addObject(objective);
          });
          objective.save().then(function(){
            newDescriptors.save().then(function(){
              self.set('manageDescriptorsObjective', null);
            });
          });
        });
      }
    },
    cancel: function(){
      var self = this;
      if(this.get('isManagingParents')){
        let objective = this.get('mangeParentsObjective');
        let parents = objective.get('parents');
        parents.clear();
        parents.addObjects(this.get('initialStateForManageParentsObjective'));
        self.set('mangeParentsObjective', null);
      }

      if(this.get('isManagingDescriptors')){
        let objective = this.get('manageDescriptorsObjective');
        let descriptors = objective.get('meshDescriptors');
        descriptors.clear();
        descriptors.addObjects(this.get('initialStateForManageMeshObjective'));
        self.set('manageDescriptorsObjective', null);
      }
    }
  }
});
