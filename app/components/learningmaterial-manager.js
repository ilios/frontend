import Ember from 'ember';
import layout from '../templates/components/learningmaterial-manager';

const { Component, computed, RSVP } = Ember;
const { not } = computed;
const { Promise } = RSVP;

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
  learningMaterialStatuses: null,
  statusOptions: computed('learningMaterialStatuses.[]', function(){
    return new Promise(resolve => {
      this.get('learningMaterialStatuses').then(statuses => {
        resolve(statuses.map(function(status){
          return Ember.Object.create({
            id: status.get('id'),
            title: status.get('title')
          });
        }).sortBy('title'));
      });
    });
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
      this.get('learningMaterialStatuses').then(statuses => {
        let status = statuses.findBy('id', id);
        this.set('status', status);
      });
    },
    changeStatus() {
      this.sendAction('changeStatus', this.get('status'));
    },
    revertStatusChanges(){
      this.set('status', this.get('valueBuffer').get('status'));
    },
    changeRequired(value) {
      this.sendAction('changeRequired', value);
    },
    changePublicNotes(value) {
      this.sendAction('changePublicNotes', value);
    },
    saveNoteChanges() {
      const notes = this.get('notes');
      return this.get('changeNotes')(notes);
    },
    revertNoteChanges(){
      this.set('notes', this.get('valueBuffer').get('notes'));
    }
  }
});
