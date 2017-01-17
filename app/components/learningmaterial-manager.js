import Ember from 'ember';
import layout from '../templates/components/learningmaterial-manager';

const { Component, computed } = Ember;
const { not } = computed;

export default Component.extend({
  layout: layout,
  classNames: ['learningmaterial-manager'],
  didReceiveAttrs(){
    this._super(...arguments);
    this.set('status', this.get('valueBuffer').get('status'));
    this.set('notes', this.get('valueBuffer').get('notes'));
  },
  status: null,
  notes: null,
  learningMaterial: null,
  valueBuffer: null,
  isCourse: false,
  isSession: not('isCourse'),
  editable: true,
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
    setStatus(id) {
      let status = this.get('learningMaterialStatuses').findBy('id', id);
      this.set('status', status);
    },
    changeStatus: function(){
      this.sendAction('changeStatus', this.get('status'));
    },
    revertStatusChanges(){
      this.set('status', this.get('valueBuffer').get('status'));
    },
    changeRequired: function(value){
      this.sendAction('changeRequired', value);
    },
    changePublicNotes: function(value){
      this.sendAction('changePublicNotes', value);
    },
    changeNotes(event, editor){
      if(editor){
        const contents = editor.html.get();
        this.set('notes', contents);
      }
    },
    saveNoteChanges: function(){
      const notes = this.get('notes');
      return this.get('changeNotes')(notes);
    },
    revertNoteChanges(){
      this.set('notes', this.get('valueBuffer').get('notes'));
    }
  }
});
