import Ember from 'ember';
import layout from '../templates/components/learningmaterial-manager';

export default Ember.Component.extend({
  layout: layout,
  classNames: ['learningmaterial-manager'],
  learningMaterial: null,
  isCourse: false,
  isSession: Ember.computed.not('isCourse'),
  learningMaterialStatuses: [],
  statusOptions: function(){
    return this.get('learningMaterialStatuses').map(function(status){
      return Ember.Object.create({
        id: status.get('id'),
        title: status.get('title')
      });
    }).sortBy('title');
  }.property('learningMaterialStatuses.@each'),
  actions: {
    changeStatus: function(statusId){
      var newStatus = this.get('learningMaterialStatuses').findBy('id', statusId);
      this.get('learningMaterial.learningMaterial').then(function(lm){
        lm.set('status', newStatus);
      });
    },
    addMeshTerm: function(descriptor){
      var subject = this.get('learningMaterial');
      subject.get('meshDescriptors').addObject(descriptor);
      if(this.get('isCourse')){
        descriptor.get('courseLearningMaterials').addObject(subject);
      }
      if(this.get('isSession')){
        descriptor.get('sessionLearningMaterials').addObject(subject);
      }
    },
    removeMeshTerm: function(descriptor){
      var self = this;
      var subject = this.get('learningMaterial');

      subject.get('meshDescriptors').then(function(descriptors){
        var promise;
        descriptors.removeObject(descriptor);
        if(self.get('isCourse')){
          promise = descriptor.get('courseLearningMaterials');
        }
        if(self.get('isSession')){
          promise = descriptor.get('sessionLearningMaterials');
        }
        promise.then(function(materials){
          materials.removeObject(subject);
        });
      });

    }
  }
});
