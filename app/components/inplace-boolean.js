import Ember from 'ember';
import InPlace from 'ilios/mixins/inplace';

const { Component } = Ember;

export default Component.extend(InPlace, {
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
