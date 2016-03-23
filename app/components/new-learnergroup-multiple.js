import Ember from 'ember';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios/mixins/validation-error-display';

const { Component } = Ember;

const Validations = buildValidations({
  numSubGroups: [
    validator('presence', true),
    validator('number', {
      allowString: true,
      integer: true,
      gt: 0,
      lte: 50
    }),
  ],
});

export default Component.extend(Validations, ValidationErrorDisplay, {
  numSubGroups: null,
  isSaving: false,

  actions: {
    save() {
      this.send('addErrorDisplayFor', 'numSubGroups');
      this.validate().then(({validations}) => {
        if (validations.get('isValid')) {
          const num = this.get('numSubGroups');
          this.sendAction('generateNewLearnerGroups', num);
        }
      });
    },

    cancel() {
      this.sendAction('cancel');
    },
  }
});
