import Component from '@glimmer/component';
import { task, timeout } from 'ember-concurrency';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import perform from 'ember-concurrency/helpers/perform';
import t from 'ember-intl/helpers/t';
import FaIcon from 'ilios-common/components/fa-icon';

export default class EditableTextComponent extends Component {
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
      this.args.close(false);
    }
  });

  closeEditor = task({ drop: true }, async () => {
    await timeout(1);
    await this.args.close();
  });

  @action
  edit() {
    if (this.args.edit) {
      this.args.edit();
    }
  }

  <template>
    <div class="editable-text" data-test-editable-text ...attributes>
      <span class="content">
        {{#if @isEditing}}
          <span class="editor">
            {{yield this.saveData.isRunning (perform this.saveData) (perform this.closeEditor)}}
            <span class="actions">
              <button
                type="button"
                class="done"
                title={{t "general.save"}}
                {{on "click" (perform this.saveData)}}
                data-test-save
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
          {{#if this.hasVisibleValue}}
            {{#if (has-block "value")}}
              {{yield to="value"}}
            {{else}}
              {{@value}}
            {{/if}}
          {{else}}
            <button type="button" class="link-button" data-test-edit {{on "click" this.edit}}>
              {{t "general.clickToEdit"}}
            </button>
          {{/if}}
        {{/if}}
      </span>
    </div>
  </template>
}
