import Ember from 'ember';

const { Component } = Ember;

export default Component.extend({
  isEditing: false,
  isSaving: false,
  classNames: ['editinplace'],
  actions: {
    edit(){
      this.set('isEditing', true);
    },
    save(){
      this.set('isSaving', true);
      this.get('save')().then(() => {
        this.set('isSaving', false);
        this.set('isEditing', false);
      });
    },
    close(){
      this.set('isEditing', false);
    },
  }
});
