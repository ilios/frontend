import Ember from 'ember';

export default Ember.Mixin.create({
    i18n: Ember.inject.service(),
    tagName: 'span',
    value: null,
    //use a value buffer to avoid sending data up
    buffer: null,
    valueChanges: false,
    clickPromptTranslation: null,
    clickPrompt: Ember.computed('i18n.locale', 'clickPromptTranslation', function() {
      if(this.get('clickPromptTranslation')){
        return this.get('i18n').t(this.get('selectPromptTranslation'));
      }
      
      return this.get('i18n').t('general.clickToEdit');
    }),
    isEditing: false,
    saveOnChange: false,
    //allows the calling object to send some context like an id
    //which can be used during the save process
    condition: null,
    actions: {
      edit: function(){
        if(this.get('buffer') == null && !this.get('valueChanged')){
          this.set('buffer', this.get('value'));
        }
        this.set('isEditing', true);
      },
      changeValue: function(value){
        this.set('valueChanged', true);
        this.set('buffer', value);
        if(this.get('saveOnChange')){
          this.send('save');
        }
      },
      cancel: function(){
        this.set('buffer', null);
        this.set('valueChanged', false);
        this.set('isEditing', false);
      },
      save: function(){
        let value = this.get('valueChanged')?this.get('buffer'):this.get('value');
        this.set('buffer', null);
        this.set('valueChanged', false);
        this.sendAction('save', value, this.get('condition'));
        this.set('isEditing', false);
      }
    }
});
