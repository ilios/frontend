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
      //if no change is made froala sometimes returns a blank so we have to check this first
      if (this.get('valueChanged')) {
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
        this.sendAction('save', value, this.get('condition'));
      }
      this.setProperties({ buffer: null, valueChanged: false, isEditing: false });
    },
    contentChanged(event, editor){
      const html = editor.getHTML();
      const buffer = this.get('buffer');
      const isEditing = this.get('isEditing');
      if (isEditing && html !== buffer) {
        this.set('valueChanged', true);
      }
    }
  }
});
