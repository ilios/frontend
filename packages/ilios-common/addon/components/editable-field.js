import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { dropTask, timeout } from 'ember-concurrency';
import { action } from '@ember/object';

export default class EditableFieldComponent extends Component {
  @tracked isEditing = false;

  get looksEmpty() {
    const value = this.args.value || '';
    const text = value.toString();
    const noTagsText = text.replace(/(<([^>]+)>)/gi, '');
    const strippedText = noTagsText.replace(/&nbsp;/gi, '').replace(/\s/g, '');

    return strippedText.length === 0;
  }

  saveData = dropTask(async () => {
    await timeout(1);
    const result = await this.args.save();
    if (result !== false) {
      this.setIsEditing(false);
    }
  });

  closeEditor = dropTask(async () => {
    await timeout(1);
    await this.args.close();
    this.setIsEditing(false);
  });

  focusFirstControl(element) {
    const elements = element.querySelectorAll('input,textarea,select,.fr-element');
    if (elements.length) {
      const visibleControls = Array.from(elements).filter((el) => {
        return !el.hidden;
      });
      visibleControls[0].focus();
    }
  }

  @action
  keyup(event) {
    const keyCode = event.keyCode;
    const target = event.target;

    // only process key events coming from text input/textarea.
    if (!['text', 'textarea'].includes(target.type)) {
      return;
    }

    if (13 === keyCode && this.args.saveOnEnter) {
      this.saveData.perform();
    } else if (27 === keyCode && this.args.closeOnEscape) {
      this.closeEditor.perform();
    }
  }

  @action
  setIsEditing(status) {
    this.isEditing = status;
    if (this.args.onEditingStatusChange) {
      this.args.onEditingStatusChange(status);
    }
  }
}
