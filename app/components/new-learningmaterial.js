import Ember from 'ember';
import config from 'ilios/config/environment';
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
  editorParams: config.froalaEditorDefaults,
  actions: {
    save: function(){
      this.sendAction('save', this.get('learningMaterial'));
    },
    remove: function(){
      this.sendAction('remove', this.get('learningMaterial'));
    },
    setFile: function(e){
      this.get('learningMaterial').set('filename', e.filename);
      this.get('learningMaterial').set('fileHash', e.fileHash);
    },
    changeSelectedStatus(){
      let selectedEl = this.$('select')[0];
      let selectedIndex = selectedEl.selectedIndex;
      let learningMaterialStatuses = this.get('learningMaterialStatuses');
      let status = learningMaterialStatuses.toArray()[selectedIndex];
      this.set('learningMaterial.status', status);
    },
    changeSelectedRole(){
      let selectedEl = this.$('select')[1];
      let selectedIndex = selectedEl.selectedIndex;
      let learningMaterialUserRoles = this.get('learningMaterialUserRoles');
      let role = learningMaterialUserRoles.toArray()[selectedIndex];
      this.set('learningMaterial.userRole', role);
    },
    changeDescription(event, editor){
      if(editor){
        this.get('learningMaterial').set('description', editor.getHTML());
      }
    },
  }
});
