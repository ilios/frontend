import Ember from 'ember';
import { timeout, task } from 'ember-concurrency';

const { Component, computed, isEmpty } = Ember;

export default Component.extend({
  value: null,
  isEditing: false,
  isSaving: false,
  isSaveDisabled: true,
  renderHtml: false,
  classNames: ['editinplace'],
  clickPrompt: null,
  looksEmpty: computed('value', function(){
    let value = this.get('value') || '';
    let text = value.toString();
    let noTagsText = text.replace(/(<([^>]+)>)/ig,"");
    let strippedText = noTagsText.replace(/&nbsp;/ig,"").replace(/\s/g, "");

    return isEmpty(strippedText);
  }),

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
