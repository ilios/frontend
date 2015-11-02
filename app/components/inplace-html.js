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
    save() {
      const editor = this.$('.control .froala-box');
      let value;
      if(editor){
        let html = editor.editable('getHTML');
        let plainText = html.replace(/(<([^>]+)>)/ig,"");
        //if all we have is empty html then save null
        if(plainText.length === 0){
          html = null;
        } 
        value = html;
      }
      this.setProperties({ buffer: null, valueChanged: false, isEditing: false });
      this.sendAction('save', value, this.get('condition'));
    }
  }
});
