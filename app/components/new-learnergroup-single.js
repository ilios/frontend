import Ember from 'ember';
import ValidationError from 'ilios/mixins/validation-error';
import EmberValidations from 'ember-validations';

const { Component, computed, inject } = Ember;
const { service } = inject;
const { alias } = computed;

export default Component.extend(ValidationError, EmberValidations, {
  i18n: service(),
  singleMode: true,

  tagName: 'div',
  title: null,

  validationBuffer: alias('title'),

  validations: {
    'validationBuffer': {
      presence: true,
      length: { minimum: 3, maximum: 200 }
    },
  },

  actions: {
    save() {
      this.validate()
        .then(() => {
            const title = this.get('title');
            this.sendAction('save', title)
          })
        .catch(() => {});
    },

    cancel() {
      this.sendAction('cancel');
    },

    changeValue(value) {
       this.set('title', value);
    },
  }
});
