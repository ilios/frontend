import Ember from 'ember';

const { Component, inject, computed } = Ember;
const { service } = inject;

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
  i18n: service(),
  content: '',
  options: computed('i18n.locale', function(){
    const i18n = this.get('i18n');
    const language = i18n.get('locale');

    return {
      key   : 'vD1Ua1Mf1e1VSYKa1EPYD==',
      theme : 'gray',
      language,
      toolbarInline: false,
      placeholderText: '',
      allowHTML: true,
      saveInterval: false,
      pastePlain: true,
      spellcheck: true,
      toolbarButtons: defaultButtons,
      toolbarButtonsMD: defaultButtons,
      toolbarButtonsSM: defaultButtons,
      toolbarButtonsXS: defaultButtons,
      quickInsertButtons: false,
      pluginsEnabled: ['lists', 'code_view', 'link'],
    };
  })

});
