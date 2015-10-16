import Ember from 'ember';
import config from 'ilios/config/environment';
import InPlace from 'ilios/mixins/inplace';

export default Ember.Component.extend(InPlace, {
  classNames: ['editinplace', 'inplace-html'],
  editorParams: config.froalaEditorDefaults,
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
