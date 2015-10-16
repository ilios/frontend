import Ember from 'ember';
import InPlace from 'ilios/mixins/inplace';

export default Ember.Component.extend(InPlace, {
  classNames: ['editinplace', 'inplace-html'],
  editorParams: Ember.computed('buffer', 'clickPrompt', function(){
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
        'subscript',
        'superscript',
        'insertOrderedList',
        'insertUnorderedList',
        'createLink',
        // 'html' //temporarily disabled due to bug
      ]
    };
    
    return params;
  }),
  willDestroyElement(){
    this.$('.control .froala-box').editable('destroy');
  },
  actions: {
    grabChangedValue: function(event, editor){
      if(editor){
        this.send('changeValue', editor.getHTML());
      }
    }
  }
});
