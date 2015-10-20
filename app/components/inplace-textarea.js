import Ember from 'ember';
import InPlaceValidation from 'ilios/mixins/inplace-validation';
import ValidationSessionDescription from 'ilios/mixins/validation-session-description';
import EmberValidations from 'ember-validations';

const { Component, isBlank } = Ember;

export default Component.extend(InPlaceValidation, EmberValidations, ValidationSessionDescription, {
  classNames: ['editinplace', 'inplace-textarea'],

  init() {
    this._super(...arguments);

    if (isBlank(this.get('value'))) {
      this.set('value', '');
    }
  },

  validationNeeded: true
});
