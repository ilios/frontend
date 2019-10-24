import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { computed } from '@ember/object';
import { loadFroalaEditor } from 'ilios-common/utils/load-froala-editor';
import layout from '../templates/components/html-editor';

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
  'data-test-html-editor': true,

  options: computed('intl.locale', function(){
    const intl = this.get('intl');
    const language = intl.get('locale');

    return {
      apiKey: 'Kb3A3pE2E2A1E4G4I4oCd2ZSb1XHi1Cb2a1KIWCWMJHXCLSwG1G1B2C1B1C7F6E1E4F4==',
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
          this.update(this.editor.html.get());
        }
      },
    };
  }),
  didInsertElement() {
    loadFroalaEditor().then(({ FroalaEditor }) => {
      this.editor = new FroalaEditor(this.element, this.options, () => {
        this.editor.html.set(this.content);
      });
    });
  },
  willDestroyElement() {
    if (this.editor) {
      this.editor.destroy();
    }
  },
});
