import Ember from 'ember';

const { Component } = Ember;

export default Component.extend({
  isEditing: false,
  isSaving: false,
  renderHtml: false,
  classNames: ['editinplace'],
  clickPrompt: null,

  actions: {
    edit(){
      this.set('isEditing', true);
    },
    save(){
      this.set('isSaving', true);
      this.get('save')().then(() => {
        this.set('isEditing', false);
      }).finally(() => {
        this.set('isSaving', false);
      });
    },
    close(){
      this.get('close')();
      this.set('isEditing', false);
    },
  }
});
