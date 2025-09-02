import Component from '@glimmer/component';
import { service } from '@ember/service';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import { modifier } from 'ember-modifier';
import { on } from '@ember/modifier';
import t from 'ember-intl/helpers/t';
import pick from 'ilios-common/helpers/pick';
import set from 'ember-set-helper/helpers/set';
import not from 'ember-truth-helpers/helpers/not';
import onKey from 'ember-keyboard/modifiers/on-key';
import { task } from 'ember-concurrency';
import perform from 'ember-concurrency/helpers/perform';
import YupValidations from 'ilios-common/classes/yup-validations';
import { string } from 'yup';
import YupValidationMessage from 'ilios-common/components/yup-validation-message';
import { TrackedAsyncData } from 'ember-async-data';
import { loadQuillEditor } from 'ilios-common/utils/load-quill-editor';

const DEFAULT_URL_VALUE = 'https://';

export default class HtmlEditorComponent extends Component {
  @service intl;
  @tracked editorId = null;
  @tracked popupUrlValue;
  @tracked popupUrlValueChanged = false;
  @tracked popupTextValue;
  @tracked popupLinkNewTarget = false;
  @tracked editorHasNoRedo = true;
  @tracked editorHasNoUndo = true;

  editor = null;

  editorInserted = modifier((element, [options]) => {
    if (!this.editor) {
      const { QuillEditor } = this.loadQuillData.value;
      this.editor = new QuillEditor(element, options);

      // create Quill Delta object from saved content so it can be re-added to editor
      // https://quilljs.com/docs/delta
      const delta = this.editor.clipboard.convert({ html: this.args.content });
      this.editor.setContents(delta);

      if (this.args.autofocus) {
        this.editor.focus();
      }

      this.editor.on('text-change', () => {
        if (!this.isDestroyed && !this.isDestroying) {
          this.editorHasNoRedo = !this.editor.history.stack.redo.length;
          this.editorHasNoUndo = !this.editor.history.stack.undo.length;
          // use editor.root.innerHTML to get actual HTML, as editor.getContents() returns custom Delta object that doesn't actually have the HTML markup: https://quilljs.com/docs/api#getcontents
          // also, retain multiple spaces in content
          this.args.update(this.editor.root.innerHTML.split('  ').join(' &nbsp;'));
        }
      });
    }

    return true;
  });

  popupValidations = new YupValidations(this, {
    popupUrlValue: string().required().trim().max(2000).url(),
    popupTextValue: string().required(),
  });

  constructor() {
    super(...arguments);
    this.editorId = guidFor(this);
  }

  @cached
  get loadQuillData() {
    return new TrackedAsyncData(loadQuillEditor());
  }

  get options() {
    return {
      debug: 'warn',
      modules: {
        toolbar: {
          container: this.toolbarId,
          handlers: {
            undo: () => {
              this.editor.history.undo();
            },
            redo: () => {
              this.editor.history.redo();
            },
            link: () => {
              this.togglePopup();
            },
          },
        },
        history: true,
      },
      theme: 'snow',
    };
  }

  get popupId() {
    return `${this.editorId}-popup`;
  }
  get popupUrlId() {
    return `${this.editorId}-popup-link-url`;
  }
  get popupTextId() {
    return `${this.editorId}-popup-link-text`;
  }
  get popupLinkNewTargetId() {
    return `${this.editorId}-popup-new-target`;
  }

  get toolbarId() {
    return `#${this.editorId}-toolbar`;
  }
  get toolbarLinkPosition() {
    return document.querySelector(`#${this.editorId}-toolbar .ql-link`).offsetLeft;
  }

  get bestUrl() {
    if (this.popupUrlValue || this.popupUrlValueChanged) {
      return this.popupUrlValue;
    }

    return DEFAULT_URL_VALUE;
  }

  @action
  clearPopupValues() {
    this.popupUrlValue = '';
    this.popupTextValue = '';
  }

  @action
  async saveOnEnter(event) {
    // don't send an actual Enter/Return to Quill
    event.preventDefault();

    await this.addLink.perform();
  }

  @action
  onEscapeKey() {
    const popup = document.querySelector(`#${this.popupId}`);
    if (popup.classList.contains('ql-active')) {
      this.togglePopup();
    }
  }

  addLink = task(async () => {
    this.popupValidations.addErrorDisplayForAllFields();
    const isValid = await this.popupValidations.isValid();

    if (!isValid) {
      return false;
    }

    const quill = this.editor;
    const range = quill.getSelection(true);

    // no text yet, add text and link around it
    if (!range.length) {
      quill.insertText(range.index, this.popupTextValue, 'user');
    }

    quill.setSelection(range.index, this.popupTextValue.length);

    // create URL out of url string to make sure it is parsed correctly
    if (/^[a-z0-9]+(?:\.[a-z0-9]+)+$/.test(this.popupUrlValue)) {
      this.popupUrlValue = `http://${this.popupUrlValue}`;
    }

    const url = new URL(this.popupUrlValue, window.location.href);

    // double check that the url has a protocol (default to http)
    if (!url.protocol) {
      url.protocol = 'http://';
    }

    const attrs = this.popupLinkNewTarget ? { href: url.href, blank: true } : { href: url.href };
    quill.formatText(range.index, this.popupTextValue.length, 'link', attrs);

    quill.setSelection(range.index + this.popupTextValue.length);

    this.clearPopupValues();

    this.togglePopup();
  });

  @action
  togglePopup() {
    const popup = document.querySelector(`#${this.popupId}`);

    if (!popup.classList.contains('ql-active')) {
      popup.classList.add('ql-active');

      const editor = document.querySelector(`#${this.editorId}`);
      popup.style.left = `${this.toolbarLinkPosition}px`;
      popup.style.top = `${editor.offsetTop - 18}px`;

      const range = this.editor.getSelection(true);

      if (range.length) {
        this.popupTextValue = this.editor.getText(range.index, range.length);
      }

      popup.querySelector('input').focus();

      const closePopup = document.addEventListener('click', ({ target }) => {
        if (!target.closest('.ql-popup') && !target.closest('.ql-link')) {
          popup.classList.remove('ql-active');

          this.clearPopupValues();

          document.removeEventListener('click', closePopup);
        }
      });
    } else {
      popup.classList.remove('ql-active');
      this.editor.focus();
    }
  }

  @action
  selectAllText({ target }) {
    if (target.value === DEFAULT_URL_VALUE) {
      target.select();
    }
  }

  @action
  changeURL(value) {
    this.popupValidations.addErrorDisplayFor('popupUrlValue');
    value = value.trim();
    const regex = RegExp('https://http[s]?:');
    if (regex.test(value)) {
      value = value.substring(8);
    }
    this.popupUrlValue = value;
    this.popupUrlValueChanged = true;
  }

  willDestroy() {
    super.willDestroy(...arguments);
    if (this.editor) {
      this.editor = null;
    }
  }
  <template>
    {{#if this.loadQuillData.isResolved}}
      <div
        class="quill-html-editor"
        {{onKey "Escape" this.onEscapeKey}}
        data-test-quill-html-editor
      >
        <div id="{{this.editorId}}-toolbar" data-test-toolbar>
          <div class="ql-formats">
            <button
              type="button"
              class="ql-bold"
              title={{t "general.htmlEditor.titles.bold"}}
              aria-label={{t "general.htmlEditor.labels.bold"}}
              data-test-toolbar-bold
            ></button>
            <button
              type="button"
              class="ql-italic"
              title={{t "general.htmlEditor.titles.italic"}}
              aria-label={{t "general.htmlEditor.labels.italic"}}
              data-test-toolbar-italic
            ></button>
            <button
              type="button"
              class="ql-script"
              value="sub"
              title={{t "general.htmlEditor.titles.subscript"}}
              aria-label={{t "general.htmlEditor.labels.subscript"}}
              data-test-toolbar-subscript
            ></button>
            <button
              type="button"
              class="ql-script"
              value="super"
              title={{t "general.htmlEditor.titles.superscript"}}
              aria-label={{t "general.htmlEditor.labels.superscript"}}
              data-test-toolbar-superscript
            ></button>
            <button
              type="button"
              class="ql-list"
              value="ordered"
              title={{t "general.htmlEditor.titles.listOrdered"}}
              aria-label={{t "general.htmlEditor.labels.listOrdered"}}
              data-test-toolbar-list-ordered
            ></button>
            <button
              type="button"
              class="ql-list"
              value="bullet"
              title={{t "general.htmlEditor.titles.listUnordered"}}
              aria-label={{t "general.htmlEditor.labels.listUnordered"}}
              data-test-toolbar-list-unordered
            ></button>
            <button
              type="button"
              class="ql-link"
              title={{t "general.htmlEditor.titles.insertLink"}}
              aria-label={{t "general.htmlEditor.labels.insertLink"}}
              data-test-toolbar-link
            ></button>
          </div>
          <div class="ql-formats">
            <button
              type="button"
              class="ql-undo"
              title={{t "general.htmlEditor.titles.undo"}}
              aria-label={{t "general.htmlEditor.labels.undo"}}
              disabled={{this.editorHasNoUndo}}
              data-test-toolbar-undo
            ></button>
            <button
              type="button"
              class="ql-redo"
              title={{t "general.htmlEditor.titles.redo"}}
              aria-label={{t "general.htmlEditor.labels.redo"}}
              disabled={{this.editorHasNoRedo}}
              data-test-toolbar-redo
            ></button>
          </div>
        </div>

        <div
          {{this.editorInserted this.options}}
          id={{this.editorId}}
          class="html-editor"
          data-test-html-editor
        >
        </div>

        <div
          id={{this.popupId}}
          class="ql-popup"
          {{onKey "Enter" this.saveOnEnter}}
          data-test-insert-link-popup
        >
          <form data-test-form>
            <label for={{this.popupUrlId}}>
              {{! template-lint-disable no-bare-strings}}
              <input
                id={{this.popupUrlId}}
                type="text"
                aria-label={{t "general.url"}}
                placeholder="https://example.com"
                value={{this.bestUrl}}
                inputmode="url"
                disabled={{if this.addLink.isRunning "disabled"}}
                {{on "input" (pick "target.value" this.changeURL)}}
                {{on "focus" this.selectAllText}}
                {{this.popupValidations.attach "popupUrlValue"}}
                data-test-url
              />
              <YupValidationMessage
                @description={{t "general.htmlEditor.errors.linkUrl"}}
                @validationErrors={{this.popupValidations.errors.popupUrlValue}}
              />
            </label>
            <br />
            <label for={{this.popupTextId}}>
              <input
                id={{this.popupTextId}}
                type="text"
                aria-label={{t "general.text"}}
                placeholder={{t "general.text"}}
                value={{this.popupTextValue}}
                disabled={{if this.addLink.isRunning "disabled"}}
                {{on "input" (pick "target.value" (set this "popupTextValue"))}}
                {{this.popupValidations.attach "popupTextValue"}}
                data-test-text
              />
              <YupValidationMessage
                @description={{t "general.htmlEditor.errors.linkText"}}
                @validationErrors={{this.popupValidations.errors.popupTextValue}}
              />
            </label>
            <br />
            <div class="form-group">
              <input
                type="checkbox"
                id={{this.popupLinkNewTargetId}}
                checked={{this.popupLinkNewTarget}}
                {{on "click" (set this "popupLinkNewTarget" (not this.popupLinkNewTarget))}}
                data-test-link-new-target
              />
              <label for={{this.popupLinkNewTargetId}}>
                {{t "general.htmlEditor.titles.linkNewTarget"}}
              </label>
            </div>

            <button
              type="button"
              disabled={{if this.addLink.isRunning "disabled"}}
              {{on "click" (perform this.addLink)}}
              data-test-submit
            >{{t "general.htmlEditor.titles.insert"}}</button>
          </form>
        </div>
      </div>
    {{/if}}
  </template>
}
