import Ember from 'ember';
import layout from '../templates/components/new-learningmaterial';

export default Ember.Component.extend({
  layout: layout,
  classNames: ['newlearningmaterial'],
  learningMaterial: null,
  learningMaterialStatuses: [],
  learningMaterialUserRoles: [],
  hasCopyrightPermission: false,
  isFile: function(){
    return this.get('learningMaterial.type') === 'file';
  }.property('learningMaterial.type'),
  isLink: function(){
    return this.get('learningMaterial.type') === 'link';
  }.property('learningMaterial.type'),
  isCitation: function(){
    return this.get('learningMaterial.type') === 'citation';
  }.property('learningMaterial.type'),
  actions: {
    save: function(){
      this.sendAction('save', this.get('learningMaterial'));
    },
    remove: function(){
      this.sendAction('remove', this.get('learningMaterial'));
    },
  }
});
