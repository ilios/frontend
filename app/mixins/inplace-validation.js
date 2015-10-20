import Ember from 'ember';

const { computed, inject, isBlank, isEqual, Mixin } = Ember;
const { service } = inject;

export default Mixin.create({
  i18n: service(),

  isEditing: false,

  clickPromptTranslation: null,

  clickPrompt: computed('i18n.locale', 'clickPromptTranslation', {
    get() {
      const i18n = this.get('i18n');

      if (this.get('clickPromptTranslation')) {
        return i18n.t(this.get('selectPromptTranslation'));
      }

      return i18n.t('general.clickToEdit');
    }
  }).readOnly(),

  saveOnChange: false,

  buffer: null,

  validationNeeded: false,

  // Allows the calling object to send some context like an id
  // Can be used during the save process
  condition: null,

  actions: {
    changeValue(value) {
      this.set('buffer', value);

      if (this.get('saveOnChange')) {
        this.send('save');
      }
    },

    edit() {
      const value = this.get('value');

      if (isBlank(value)) {
        this.setProperties({ isEditing: true, buffer: '' });
      } else {
        this.setProperties({ isEditing: true, buffer: value });
      }
    },

    save() {
      const value = this.get('value');
      const buffer = this.get('buffer');
      const condition = this.get('condition');

      if (this.get('validationNeeded')) {
        this.validate().then(() => {
          if (!isEqual(value, buffer)) {
            this.sendAction('save', buffer);
          }

          this.set('isEditing', false);
        });
      } else {
        if (!isEqual(value, buffer)) {
          this.sendAction('save', buffer, condition);
        }

        this.set('isEditing', false);
      }
    },

    cancel() {
      const value = this.get('value');

      this.setProperties({ buffer: value, isEditing: false });
    }
  }
});
