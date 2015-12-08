import Ember from 'ember';
import layout from '../templates/components/learningmaterial-manager';

const { Component, computed } = Ember;
const { not } = computed;

export default Component.extend({
  layout: layout,
  classNames: ['learningmaterial-manager'],
  learningMaterial: null,
  valueBuffer: null,
  isCourse: false,
  isSession: not('isCourse'),
  learningMaterialStatuses: [],
  statusOptions: computed('learningMaterialStatuses.[]', function(){
    return this.get('learningMaterialStatuses').map(function(status){
      return Ember.Object.create({
        id: status.get('id'),
        title: status.get('title')
      });
    }).sortBy('title');
  }),
  isFile: computed('learningMaterial.learningMaterial.type', function(){
    return this.get('learningMaterial.learningMaterial.type') === 'file';
  }),
  isLink: computed('learningMaterial.learningMaterial.type', function(){
    return this.get('learningMaterial.learningMaterial.type') === 'link';
  }),
  isCitation: computed('learningMaterial.learningMaterial.type', function(){
    return this.get('learningMaterial.learningMaterial.type') === 'citation';
  }),
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
