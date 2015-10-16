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

  actions: {
    changeValue(value) {
      this.set('buffer', value);
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

      this.validate().then(() => {
        if (!isEqual(value, buffer)) {
          this.sendAction('save', this.get('buffer'));
        }

        this.send('cancel');
      });
    },

    cancel() {
      const value = this.get('value');

      this.setProperties({ buffer: value, isEditing: false });
    }
  }
});
