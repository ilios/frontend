import Ember from 'ember';
import InPlaceValidation from 'ilios/mixins/inplace-validation';
import ValidationError from 'ilios/mixins/validation-error';
import EmberValidations from 'ember-validations';

const { Component, isBlank } = Ember;

export default Component.extend(InPlaceValidation, EmberValidations, ValidationError, {
  classNames: ['editinplace', 'inplace-textarea'],

  init() {
    this._super(...arguments);

    if (isBlank(this.get('value'))) {
      this.set('value', '');
    }
  }
});
