import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { restartableTask } from 'ember-concurrency';
import { loadFroalaEditor } from 'ilios-common/utils/load-froala-editor';
import { guidFor } from '@ember/object/internals';

export default class HtmlEditorComponent extends Component {
  @service intl;
  @tracked editor = null;
  @tracked editorId = null;
  @tracked loadFinished = false;

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

  get options() {
    return {
      key: 'Kb3A3pE2E2A1E4G4I4oCd2ZSb1XHi1Cb2a1KIWCWMJHXCLSwG1G1B2C1B1C7F6E1E4F4==',
      theme: 'gray',
      attribution: false,
      language: this.intl.locale,
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
  createEditor(element, options) {
    return new Promise((resolve) => {
      loadFroalaEditor().then(({ FroalaEditor }) => {
        new FroalaEditor(element, options, function () {
          resolve(this);
        });
      });
    });
  }

  loadEditor = restartableTask(async (element, [options]) => {
    if (!this.editor) {
      this.editor = await this.createEditor(element, options);
      this.editor.html.set(this.args.content);
      this.loadFinished = true;
    }

    return true;
  });
}
