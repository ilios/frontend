import Ember from 'ember';
import InPlaceValidation from 'ilios/mixins/inplace-validation';
import ValidationExternalId from 'ilios/mixins/validation-external-id';
import EmberValidations from 'ember-validations';

const { Component, isBlank } = Ember;

export default Component.extend(InPlaceValidation, EmberValidations, ValidationExternalId, {
  classNames: ['editinplace', 'inplace-text'],

  init() {
    this._super(...arguments);

    if (isBlank(this.get('value'))) {
      this.set('value', '');
    }
  },

  validationNeeded: true
});
