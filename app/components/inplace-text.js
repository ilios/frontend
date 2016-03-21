import Ember from 'ember';
import InPlace from 'ilios/mixins/inplace';

const { Component, isBlank } = Ember;

export default Component.extend(InPlace, {
  classNames: ['editinplace', 'inplace-text'],

  init() {
    this._super(...arguments);

    if (isBlank(this.get('value'))) {
      this.set('value', '');
    }
  }
});
