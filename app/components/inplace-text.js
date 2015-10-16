import Ember from 'ember';
import InPlace2 from 'ilios/mixins/inplace2';
import ValidationExternalId from 'ilios/mixins/validation-external-id';
import EmberValidations from 'ember-validations';

const { Component, isBlank } = Ember;

export default Component.extend(InPlace2, EmberValidations, ValidationExternalId, {
  classNames: ['editinplace', 'inplace-text'],

  init() {
    this._super(...arguments);

    if (isBlank(this.get('value'))) {
      this.set('value', '');
    }
  }
});
