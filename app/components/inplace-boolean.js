import Ember from 'ember';
import InPlaceValidation from 'ilios/mixins/inplace-validation';

const { Component } = Ember;

export default Component.extend(InPlaceValidation, {
  classNames: ['editinplace', 'inplace-boolean'],

  saveOnChange: true,

  actions: {
    toggleValue() {
      if (this.get('buffer') === null) {
        this.set('buffer', this.get('value'));
      }

      this.send('changeValue', !this.get('buffer'));
    }
  }
});
