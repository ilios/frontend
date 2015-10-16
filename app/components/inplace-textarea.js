import Ember from 'ember';
import InPlace2 from 'ilios/mixins/inplace2';
import ValidationSessionDescription from 'ilios/mixins/validation-session-description';
import EmberValidations from 'ember-validations';

const { Component, isBlank } = Ember;

export default Component.extend(InPlace2, EmberValidations, ValidationSessionDescription, {
  classNames: ['editinplace', 'inplace-textarea'],

  init() {
    this._super(...arguments);

    if (isBlank(this.get('value'))) {
      this.set('value', '');
    }
  }
});
