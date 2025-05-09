import Component from '@glimmer/component';
import { service } from '@ember/service';
import { cached, tracked } from '@glimmer/tracking';
import { loadFroalaEditor } from 'ilios-common/utils/load-froala-editor';
import { guidFor } from '@ember/object/internals';
import { modifier } from 'ember-modifier';
import { TrackedAsyncData } from 'ember-async-data';

export default class HtmlEditorComponent extends Component {
  @service intl;
  @tracked editorId = null;
  @tracked loadFinished = false;

  editor = null;
  defaultButtons = {
    moreText: {
      buttons: ['bold', 'italic', 'subscript', 'superscript', 'formatOL', 'formatUL', 'insertLink'],
      buttonsVisible: 7,
    },
    moreMisc: {
      buttons: ['undo', 'redo', 'html'],
      align: 'right',
    },
  };

  constructor() {
    super(...arguments);
    this.editorId = guidFor(this);
  }

  @cached
  get loadFroalaData() {
    return new TrackedAsyncData(loadFroalaEditor());
  }

  editorInserted = modifier((element, [options]) => {
    if (!this.editor) {
      const { FroalaEditor } = this.loadFroalaData.value;
      const component = this;
      // getting the Froala instance inside its constructor callback
      // https://froala.com/wysiwyg-editor/examples/getHTML/
      this.editor = new FroalaEditor(element, options, function () {
        this.html.set(component.args.content);
        if (component.args.autoFocus) {
          this.events.focus();
        }
        component.loadFinished = true;
      });
    }

    return true;
  });

  get options() {
    return {
      key: 'Kb3A3pE2E2A1E4G4I4oCd2ZSb1XHi1Cb2a1KIWCWMJHXCLSwG1G1B2C1B1C7F6E1E4F4==',
      theme: 'gray',
      attribution: false,
      // workaround, see https://github.com/froala/wysiwyg-editor/issues/4794
      fontFamilyDefaultSelection: 'Font Family',
      fontSizeDefaultSelection: 'Font Size',
      language: this.intl.primaryLocale,
      toolbarInline: false,
      placeholderText: '',
      saveInterval: false,
      pastePlain: true,
      spellcheck: true,
      toolbarButtons: this.defaultButtons,
      toolbarButtonsMD: this.defaultButtons,
      toolbarButtonsSM: this.defaultButtons,
      toolbarButtonsXS: this.defaultButtons,
      quickInsertButtons: false,
      pluginsEnabled: ['lists', 'code_view', 'link'],
      listAdvancedTypes: false,
      shortcutsEnabled: ['bold', 'italic', 'strikeThrough', 'undo', 'redo', 'createLink'],
      events: {
        contentChanged: () => {
          if (!this.isDestroyed && !this.isDestroying) {
            this.args.update(this.editor.html.get());
          }
        },
      },
      linkList: [
        {
          displayText: 'PubMed',
          href: 'https://www.ncbi.nlm.nih.gov/pubmed/',
          target: '_blank',
        },
      ],
      linkEditButtons: ['linkEdit', 'linkRemove'],
    };
  }
  willDestroy() {
    super.willDestroy(...arguments);
    if (this.editor) {
      this.editor.destroy();
      this.editor = null;
    }
  }
  <template>
    {{#if this.loadFroalaData.isResolved}}
      <div
        {{this.editorInserted this.options}}
        id={{this.editorId}}
        class="html-editor"
        data-test-html-editor
        data-test-load-finished={{this.loadFinished}}
      >
      </div>
    {{/if}}
  </template>
}
