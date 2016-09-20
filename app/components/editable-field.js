import Ember from 'ember';
import { timeout, task } from 'ember-concurrency';

const { Component } = Ember;

export default Component.extend({
  isEditing: false,
  isSaving: false,
  isSaveDisabled: true,
  renderHtml: false,
  classNames: ['editinplace'],
  clickPrompt: null,

  saveData: task(function * () {
    yield timeout(1);
    yield this.get('save')();
    this.set('isEditing', false);
  }).drop(),

  closeEditor: task(function * () {
    yield timeout(1);
    yield this.get('close')();
    this.set('isEditing', false);
  }).drop(),
});
