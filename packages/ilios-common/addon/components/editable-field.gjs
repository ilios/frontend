import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task, timeout } from 'ember-concurrency';
import { action } from '@ember/object';
import { modifier } from 'ember-modifier';
import { on } from '@ember/modifier';
import perform from 'ember-concurrency/helpers/perform';
import t from 'ember-intl/helpers/t';
import FaIcon from 'ilios-common/components/fa-icon';
import { fn } from '@ember/helper';

export default class EditableFieldComponent extends Component {
  @tracked isEditing = false;

  saveData = task({ drop: true }, async () => {
    await timeout(1);
    const result = await this.args.save();
    if (result !== false) {
      this.setIsEditing(false);
    }
  });

  closeEditor = task({ drop: true }, async () => {
    await timeout(1);
    await this.args.close();
    this.setIsEditing(false);
  });

  focusFirstControl = modifier((element) => {
    const elements = element.querySelectorAll('input,textarea,select,.fr-element');
    if (elements.length) {
      const visibleControls = Array.from(elements).filter((el) => {
        return !el.hidden;
      });
      visibleControls[0].focus();
    }
  });

  /*
   * Modifier we can attach to the editable field elemnts so we can handle saving and closing via enter and escape
   */
  keyboard = modifier((element, _, { saveOnEnter = true, closeOnEscape = true }) => {
    this.keyboardHandler = ({ keyCode }) => {
      if (13 === keyCode && saveOnEnter) {
        this.saveData.perform();
      } else if (27 === keyCode && closeOnEscape) {
        this.closeEditor.perform();
      }
    };
    element.addEventListener('keyup', this.keyboardHandler, { passive: true });

    return () => {
      element.removeEventListener('keyup', this.keyboardHandler);
    };
  });

  @action
  setIsEditing(status) {
    this.isEditing = status;
    if (this.args.onEditingStatusChange) {
      this.args.onEditingStatusChange(status);
    }
  }
  <template>
    <div
      class="editinplace{{if this.isEditing ' is-editing'}}"
      data-test-editable-field
      ...attributes
    >
      <span class="content">
        {{#if this.isEditing}}
          <span class="editor" {{this.focusFirstControl}}>
            {{yield
              this.keyboard
              this.saveData.isRunning
              (perform this.saveData)
              (perform this.closeEditor)
            }}
            <span class="actions">
              <button
                disabled={{@isSaveDisabled}}
                type="button"
                class="done"
                title={{t "general.save"}}
                {{on "click" (perform this.saveData)}}
              >
                <FaIcon
                  @icon={{if this.saveData.isRunning "spinner" "check"}}
                  @spin={{this.saveData.isRunning}}
                />
              </button>
              <button
                class="cancel"
                type="button"
                title={{t "general.cancel"}}
                {{on "click" (perform this.closeEditor)}}
                data-test-cancel
              >
                <FaIcon @icon="xmark" />
              </button>
            </span>
          </span>
        {{else}}
          <button
            class="link-button"
            title={{if @showTitle (t "general.edit")}}
            data-test-edit
            type="button"
            {{on "click" (fn this.setIsEditing true)}}
          >
            {{#if @value}}
              {{#if (has-block "value")}}
                {{yield to="value"}}
              {{else}}
                {{@value}}
              {{/if}}
            {{else}}
              {{@clickPrompt}}
            {{/if}}
          </button>
        {{/if}}
      </span>
    </div>
  </template>
}
