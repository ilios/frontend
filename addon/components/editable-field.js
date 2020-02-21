import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { timeout } from 'ember-concurrency';
import { dropTask } from 'ember-concurrency-decorators';
import { action } from '@ember/object';

export default class EditableFieldComponent extends Component {
  @tracked isEditing = false;

  get looksEmpty(){
    const value = this.args.value || '';
    const text = value.toString();
    const noTagsText = text.replace(/(<([^>]+)>)/ig,"");
    const strippedText = noTagsText.replace(/&nbsp;/ig,"").replace(/\s/g, "");

    return strippedText.length === 0;
  }

  @dropTask
  *saveData() {
    yield timeout(1);
    const result = yield this.args.save();
    if (result !== false) {
      this.isEditing = false;
    }
  }

  @dropTask
  *closeEditor() {
    yield timeout(1);
    yield this.args.close();
    this.isEditing = false;
  }

  focusFirstControl(element) {
    const elements = element.querySelectorAll('input,textarea,select,.fr-element');
    if (elements.length) {
      const visibleControls = Array.from(elements).filter(el => {
        return !el.hidden;
      });
      visibleControls[0].focus();
    }
  }

  @action
  keydown(event) {
    const keyCode = event.keyCode;
    const target = event.target;

    // only process key events coming from text input/textarea.
    if (! ['text', 'textarea'].includes(target.type)) {
      return;
    }

    if (13 === keyCode && this.args.saveOnEnter) {
      this.saveData.perform();
    } else if(27 === keyCode && this.args.closeOnEscape) {
      this.closeEditor.perform();
    }
  }
}
