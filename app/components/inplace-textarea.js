import Ember from 'ember';
import InPlaceValidation from 'ilios/mixins/inplace-validation';

const { Component, isBlank } = Ember;

export default Component.extend(InPlaceValidation, {
  classNames: ['editinplace', 'inplace-textarea'],

  init() {
    this._super(...arguments);

    if (isBlank(this.get('value'))) {
      this.set('value', '');
    }
  }
});
