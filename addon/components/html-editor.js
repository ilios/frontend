import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { computed } from '@ember/object';
import { loadFroalaEditor } from 'ilios-common/utils/load-froala-editor';
import layout from '../templates/components/html-editor';
import { task } from 'ember-concurrency';
import { guidFor } from '@ember/object/internals';

const defaultButtons = [
  'bold',
  'italic',
  'subscript',
  'superscript',
  'formatOL',
  'formatUL',
  'insertLink',
  'html'
];
export default Component.extend({
  intl: service(),
  layout,
  editor: null,
  loadFinished: false,
  editorId: null,
  options: computed('intl.locale', function(){
    const intl = this.get('intl');
    const language = intl.get('locale');

    return {
      key: 'Kb3A3pE2E2A1E4G4I4oCd2ZSb1XHi1Cb2a1KIWCWMJHXCLSwG1G1B2C1B1C7F6E1E4F4==',
      theme: 'gray',
      attribution: false,
      language,
      toolbarInline: false,
      placeholderText: '',
      saveInterval: false,
      pastePlain: true,
      spellcheck: true,
      toolbarButtons: defaultButtons,
      toolbarButtonsMD: defaultButtons,
      toolbarButtonsSM: defaultButtons,
      toolbarButtonsXS: defaultButtons,
      quickInsertButtons: false,
      pluginsEnabled: ['lists', 'code_view', 'link'],
      listAdvancedTypes: false,
      shortcutsEnabled: ['bold', 'italic', 'strikeThrough', 'undo', 'redo', 'createLink'],
      events: {
        contentChanged: () => {
          if (!this.isDestroyed && !this.isDestroying) {
            this.update(this.editor.html.get());
          }
        }
      },
    };
  }),
  didInsertElement() {
    this._super(...arguments);
    const uid = guidFor(this.element.querySelector('div'));
    this.set('editorId', uid);
    this.loadEditor.perform();
  },
  willDestroyElement() {
    this._super(...arguments);
    if (this.editor) {
      this.editor.destroy();
      this.editor = null;
    }
  },
  createEditor(element, options) {
    return new Promise(resolve => {
      loadFroalaEditor().then(({ FroalaEditor }) => {
        new FroalaEditor(element, options, function() {
          resolve(this);
        });
      });
    });
  },
  loadEditor: task(function* () {
    if (!this.editor) {
      this.editor = yield this.createEditor(this.element.querySelector('div'), this.options);
      this.editor.html.set(this.content);
      this.set('loadFinished', true);
    }

    return true;
  }).drop(),
});
