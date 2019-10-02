import Component from '@ember/component';
import { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
import layout from '../templates/components/editable-field';
import { timeout, task } from 'ember-concurrency';

export default Component.extend({
  layout,
  value: null,
  isEditing: false,
  isSaving: false,
  isSaveDisabled: false,
  renderHtml: false,
  classNames: ['editinplace'],
  saveOnEnter: false,
  closeOnEscape: false,
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
    const result = yield this.get('save')();
    if (result !== false) {
      this.set('isEditing', false);
    }
  }).drop(),

  closeEditor: task(function * () {
    yield timeout(1);
    yield this.get('close')();
    this.set('isEditing', false);
  }).drop(),

  edit: task(function * () {
    this.set('isEditing', true);
    yield timeout(10);
    const elements = this.element.querySelectorAll('input,textarea,select,.fr-element');
    if (elements.length) {
      const visibleControls = Array.from(elements).filter(el => {
        return !el.hidden;
      });
      visibleControls[0].focus();
    }
  }).drop(),

  keyUp(event) {
    const keyCode = event.keyCode;
    const target = event.target;

    // only process key events coming from text input/textarea.
    if (! ['text', 'textarea'].includes(target.type)) {
      return;
    }

    if (13 === keyCode && this.get('saveOnEnter')) {
      this.get('saveData').perform();
    } else if(27 === keyCode && this.get('closeOnEscape')) {
      this.get('closeEditor').perform();
    }
  }
});
