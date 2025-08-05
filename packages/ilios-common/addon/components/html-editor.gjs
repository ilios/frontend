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
import { TrackedAsyncData } from 'ember-async-data';
import { loadQuillEditor } from 'ilios-common/utils/load-quill-editor';

export default class HtmlEditorComponent extends Component {
  @service intl;
  @tracked editorId = null;
  @tracked loadFinished = false;
  @tracked popupUrlValue;
  @tracked popupTextValue;
  @tracked popupLinkNewTarget;
  @tracked editorHasNoRedo = true;
  @tracked editorHasNoUndo = true;

  editor = null;

  editorInserted = modifier((element, [options]) => {
    if (!this.editor) {
      const { QuillEditor } = this.loadQuillData.value;
      this.editor = new QuillEditor(element, options);
      this.editor.setContents(this.editor.clipboard.convert({ html: this.args.content }));
      if (this.args.autofocus) {
        this.editor.focus();
      }
      this.loadFinished = true;

      this.editor.on('text-change', () => {
        if (!this.isDestroyed && !this.isDestroying) {
          this.editorHasNoRedo = !this.editor.history.stack.redo.length;
          this.editorHasNoUndo = !this.editor.history.stack.undo.length;
          // make sure to retain multiple spaces
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
  addLink() {
    const quill = this.editor;
    const range = quill.getSelection(true);

    if (this.popupUrlValue && this.popupTextValue) {
      // no text yet, add text and link around it
      if (!range.length) {
        quill.insertText(range.index, this.popupTextValue, 'user');
      }

      quill.setSelection(range.index, this.popupTextValue.length);
      quill.theme.tooltip.edit('link', this.popupUrlValue);
      quill.theme.tooltip.save();
      this.editor.setSelection(range.index + this.popupTextValue.length);

      this.popupUrlValue = '';
      this.popupTextValue = '';

      this.togglePopup();
    }
  }

  @action
  togglePopup() {
    const editor = document.querySelector(`#${this.editorId}`);
    const popup = document.querySelector(`#${this.popupId}`);
    popup.classList.toggle('ql-active');

    if (popup.classList.contains('ql-active')) {
      popup.style.left = `${this.toolbarLinkPosition}px`;
      popup.style.top = `${editor.offsetTop - 8}px`;

      const quill = this.editor;
      const range = quill.getSelection(true);

      if (range.length) {
        this.popupTextValue = quill.getText(range.index, range.length);
      }

      popup.querySelector('input').focus();
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
      <div class="quill-html-editor" data-test-quill-html-editor>
        <div id="{{this.editorId}}-toolbar">
          <div class="ql-formats">
            <button
              type="button"
              class="ql-bold"
              title={{t "general.htmlEditor.titles.bold"}}
              aria-label={{t "general.htmlEditor.labels.bold"}}
            ></button>
            <button
              type="button"
              class="ql-italic"
              title={{t "general.htmlEditor.titles.italic"}}
              aria-label={{t "general.htmlEditor.labels.italic"}}
            ></button>
            <button
              type="button"
              class="ql-script"
              value="sub"
              title={{t "general.htmlEditor.titles.subscript"}}
              aria-label={{t "general.htmlEditor.labels.subscript"}}
            ></button>
            <button
              type="button"
              class="ql-script"
              value="super"
              title={{t "general.htmlEditor.titles.superscript"}}
              aria-label={{t "general.htmlEditor.labels.superscript"}}
            ></button>
            <button
              type="button"
              class="ql-list"
              value="ordered"
              title={{t "general.htmlEditor.titles.listOrdered"}}
              aria-label={{t "general.htmlEditor.labels.listOrdered"}}
            ></button>
            <button
              type="button"
              class="ql-list"
              value="bullet"
              title={{t "general.htmlEditor.titles.listUnordered"}}
              aria-label={{t "general.htmlEditor.labels.listUnordered"}}
            ></button>
            <button
              type="button"
              class="ql-link"
              title={{t "general.htmlEditor.titles.insertLink"}}
              aria-label={{t "general.htmlEditor.labels.insertLink"}}
            ></button>
          </div>
          <div class="ql-formats">
            <button
              type="button"
              class="ql-undo"
              title={{t "general.htmlEditor.titles.undo"}}
              aria-label={{t "general.htmlEditor.labels.undo"}}
              disabled={{this.editorHasNoUndo}}
            ></button>
            <button
              type="button"
              class="ql-redo"
              title={{t "general.htmlEditor.titles.redo"}}
              aria-label={{t "general.htmlEditor.labels.redo"}}
              disabled={{this.editorHasNoRedo}}
            ></button>
          </div>
        </div>
        <div
          {{this.editorInserted this.options}}
          id={{this.editorId}}
          class="html-editor"
          data-test-html-editor
          data-test-load-finished={{this.loadFinished}}
        >
        </div>
      </div>

      <div id={{this.popupId}} class="ql-popup">
        <h4>{{t "general.htmlEditor.titles.insertLink"}}</h4>
        <label for={{this.popupUrlId}}>
          <input
            type="text"
            id={{this.popupUrlId}}
            aria-label={{t "general.url"}}
            placeholder={{t "general.url"}}
            value={{this.popupUrlValue}}
            {{on "input" (pick "target.value" (set this "popupUrlValue"))}}
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
          />
        </label>
        <br />
        <div class="form-group">
          <input type="checkbox" id={{this.popupLinkNewTargetId}} checked disabled />
          <label for={{this.popupLinkNewTargetId}}>
            {{t "general.htmlEditor.titles.linkNewTarget"}}
          </label>
        </div>

        <button type="button" {{on "click" this.addLink}}>{{t
            "general.htmlEditor.titles.insert"
          }}</button>
      </div>
    {{/if}}
  </template>
}
