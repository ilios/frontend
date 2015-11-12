import Ember from 'ember';

const { computed, inject, Mixin } = Ember;
const { service } = inject;

export default Mixin.create({
    i18n: service(),
    tagName: 'span',
    value: null,
    //use a value buffer to avoid sending data up
    buffer: null,
    valueChanged: false,
    clickPromptTranslation: null,
    clickPrompt: computed('i18n.locale', 'clickPromptTranslation', function() {
      if (this.get('clickPromptTranslation')) {
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
      edit() {
        if (this.get('buffer') == null && !this.get('valueChanged')) {
          this.set('buffer', this.get('value'));
        }

        this.set('isEditing', true);
      },

      changeValue(value){
        this.setProperties({ buffer: value, valueChanged: true });

        if (this.get('saveOnChange')) {
          this.send('save');
        }
      },

      cancel() {
        this.setProperties({ buffer: null, valueChanged: false, isEditing: false });
      },

      save() {
        let value = this.get('valueChanged')?this.get('buffer'):this.get('value');

        this.setProperties({ buffer: null, valueChanged: false, isEditing: false });
        this.sendAction('save', value, this.get('condition'));
      }
    }
});
