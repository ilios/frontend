import Ember from 'ember';
import layout from '../templates/components/learningmaterial-manager';

export default Ember.Component.extend({
  layout: layout,
  classNames: ['learningmaterial-manager'],
  learningMaterial: null,
  valueBuffer: null,
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
  isFile: function(){
    return this.get('learningMaterial.learningMaterial.type') === 'file';
  }.property('learningMaterial.learningMaterial.type'),
  isLink: function(){
    return this.get('learningMaterial.learningMaterial.type') === 'link';
  }.property('learningMaterial.learningMaterial.type'),
  isCitation: function(){
    return this.get('learningMaterial.learningMaterial.type') === 'citation';
  }.property('learningMaterial.learningMaterial.type'),
  actions: {
    changeStatus: function(statusId){
      var newStatus = this.get('learningMaterialStatuses').findBy('id', statusId);
      this.sendAction('changeStatus', newStatus);
    },
    changeRequired: function(value){
      this.sendAction('changeRequired', value);
    },
    changePublicNotes: function(value){
      this.sendAction('changePublicNotes', value);
    },
    changeNotes: function(value){
      this.sendAction('changeNotes', value);
    },
  }
});
