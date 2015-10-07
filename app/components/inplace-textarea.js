import Ember from 'ember';
import InPlace from 'ilios/mixins/inplace';

export default Ember.Component.extend(InPlace, {
  classNames: ['editinplace', 'inplace-textarea'],
  editorParams: Ember.computed('buffer', function(){
    let params = {
      inlineMode: false,
      placeholder: '',
      allowHTML: true,
      autosave: false,
      plainPaste: true,
      spellcheck: true,
      buttons: [
        'bold',
        'italic',
        'underline',
        'fontSize',
        'color',
        'insertOrderedList',
        'insertUnorderedList',
        'createLink',
        'undo',
        'redo',
        'html',
        'removeFormat',
        'fullscreen'
      ]
    };
    
    return params;
  }),
  willDestroyElement(){
    if (this.$('.control .froala-box').data('fa.editable')) {
      this.$('.control .froala-box').editable('destroy');
    }
  },
  actions: {
    pullDataAndSave(){
      let value = this.$('.control .froala-box').editable('getHTML');
      this.send('changeValue', value);
      this.send('save');
    }
  }
});
