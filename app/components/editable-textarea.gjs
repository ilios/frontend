import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task, timeout } from 'ember-concurrency';
import { action } from '@ember/object';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';
import perform from 'ember-concurrency/helpers/perform';
import onKey from 'ember-keyboard/modifiers/on-key';
import t from 'ember-intl/helpers/t';
import { faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import HtmlEditor from './html-editor';
import SaveButton from './save-button';

export default class EditableTextareaComponent extends Component {
  @tracked isEditing = false;

  get hasVisibleValue() {
    const value = this.args.value || '';
    const text = value.toString();
    const noTagsText = text.replace(/(<([^>]+)>)/gi, '');
    const strippedText = noTagsText.replace(/&nbsp;/gi, '').replace(/\s/g, '');

    return Boolean(strippedText.length);
  }

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

  @action
  onEscapeKey() {
    this.closeEditor.perform();
  }

  @action
  setIsEditing(status) {
    this.isEditing = status;
    if (this.args.onEditingStatusChange) {
      this.args.onEditingStatusChange(status);
    }
  }
  <template>
    <div data-test-editable-textarea ...attributes>
      <span class="content">
        {{#if this.isEditing}}
          <span class="editor" data-test-editor {{onKey "Escape" this.onEscapeKey}}>
            <HtmlEditor @content={{@value}} @update={{@update}} @autofocus={{true}} />
            {{yield}}
            <div class="form" data-test-actions>
              <div class="buttons">
                <SaveButton
                  class="done text"
                  @isSaving={{@isSaveDisabled}}
                  {{on "click" (perform this.saveData)}}
                  data-test-save
                >
                  {{t "general.save"}}
                </SaveButton>
                <button
                  class="cancel text"
                  type="button"
                  disabled={{this.saveData.isRunning}}
                  {{on "click" (perform this.closeEditor)}}
                  data-test-cancel
                >
                  {{t "general.cancel"}}
                </button>
              </div>
            </div>
          </span>
        {{else}}
          <button
            class="link-button"
            title={{if @showTitle (t "general.edit")}}
            data-test-edit
            type="button"
            {{on "click" (fn this.setIsEditing true)}}
          >
            {{#if this.hasVisibleValue}}
              {{#if (has-block "value")}}
                {{yield to="value"}}
              {{else}}
                {{@value}}
              {{/if}}
            {{else}}
              {{#if @clickPrompt}}
                {{@clickPrompt}}
              {{else}}
                <FaIcon @icon={{faPenToSquare}} />
              {{/if}}
            {{/if}}
          </button>
          {{yield to="postValue"}}
        {{/if}}
      </span>
    </div>
  </template>
}
