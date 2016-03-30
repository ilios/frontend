import Ember from 'ember';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios/mixins/validation-error-display';

const { Component } = Ember;

const Validations = buildValidations({
  title: [
    validator('presence', true),
    validator('length', {
      min: 3,
      max: 60
    }),
  ],
});

export default Component.extend(Validations, ValidationErrorDisplay, {
  title: null,
  isSaving: false,

  actions: {
    save() {
      this.send('addErrorDisplayFor', 'title');
      this.validate().then(({validations}) => {
        if (validations.get('isValid')) {
          const title = this.get('title');
          this.sendAction('save', title)
        }
      });
    },

    cancel() {
      this.sendAction('cancel');
    },
  }
});
