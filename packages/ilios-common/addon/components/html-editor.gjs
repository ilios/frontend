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
import { TrackedAsyncData } from 'ember-async-data';
import { loadQuillEditor } from 'ilios-common/utils/load-quill-editor';

export default class HtmlEditorComponent extends Component {
  @service intl;
  @tracked editorId = null;
  @tracked popupUrlValue;
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

  @action
  onEnterKey(event) {
    // don't send an actual Enter/Return to Quill
    event.preventDefault();

    this.addLink();
  }

  @action
  onEscapeKey() {
    const popup = document.querySelector(`#${this.popupId}`);
    if (popup.classList.contains('ql-active')) {
      this.togglePopup();
      this.editor.focus();
    }
  }

  @action
  addLink() {
    const quill = this.editor;
    const range = quill.getSelection(true);

    if (this.popupUrlValue && this.popupTextValue) {
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

      this.popupUrlValue = '';
      this.popupTextValue = '';

      this.togglePopup();
    }
  }

  @action
  togglePopup() {
    const popup = document.querySelector(`#${this.popupId}`);

    if (!popup.classList.contains('ql-active')) {
      popup.classList.add('ql-active');

      const editor = document.querySelector(`#${this.editorId}`);
      popup.style.left = `${this.toolbarLinkPosition}px`;
      popup.style.top = `${editor.offsetTop - 18}px`;

      const quill = this.editor;
      const range = quill.getSelection(true);

      if (range.length) {
        this.popupTextValue = quill.getText(range.index, range.length);
      }

      popup.querySelector('input').focus();

      const closePopup = document.addEventListener('click', ({ target }) => {
        if (!target.closest('.ql-popup') && !target.closest('.ql-link')) {
          popup.classList.remove('ql-active');
          document.removeEventListener('click', closePopup);
        }
      });
    } else {
      popup.classList.remove('ql-active');
    }
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
          {{onKey "Enter" this.onEnterKey}}
          data-test-insert-link-popup
        >
          <label for={{this.popupUrlId}}>
            <input
              type="text"
              id={{this.popupUrlId}}
              aria-label={{t "general.url"}}
              placeholder={{t "general.url"}}
              value={{this.popupUrlValue}}
              {{on "input" (pick "target.value" (set this "popupUrlValue"))}}
              data-test-url
            />
          </label>
          <br />
          <label for={{this.popupTextId}}>
            <input
              type="text"
              id={{this.popupTextId}}
              aria-label={{t "general.text"}}
              placeholder={{t "general.text"}}
              value={{this.popupTextValue}}
              {{on "input" (pick "target.value" (set this "popupTextValue"))}}
              data-test-text
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

          <button type="button" {{on "click" this.addLink}} data-test-submit>{{t
              "general.htmlEditor.titles.insert"
            }}</button>
        </div>
      </div>
    {{/if}}
  </template>
}
