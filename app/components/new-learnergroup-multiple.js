import Ember from 'ember';
import ValidationError from 'ilios/mixins/validation-error';
import EmberValidations from 'ember-validations';

const { Component, computed, inject } = Ember;
const { service } = inject;
const { alias } = computed;

export default Component.extend(ValidationError, EmberValidations, {
  i18n: service(),
  singleMode: true,

  isSaving: false,

  tagName: 'div',

  numSubGroups: null,

  validationBuffer: alias('numSubGroups'),

  validations: {
    'validationBuffer': {
      presence: true,
      numericality: { onlyInteger: true, greaterThan: 0, lessThanOrEqualTo : 50 }
    },
  },

  actions: {
    save() {
      this.validate()
        .then(() => {
          this.set('isSaving', true);
          const num = this.get('numSubGroups');
          this.sendAction('generateNewLearnerGroups', num);
        })
        .catch(() => {});
    },

    cancel() {
      this.sendAction('cancel');
    },

    changeValue(value) {
      this.set('numSubGroups', value);
    }
  }
});
