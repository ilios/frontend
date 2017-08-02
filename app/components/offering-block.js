import Ember from 'ember';
import layout from '../templates/components/offering-block';

const { Component } = Ember;

export default Component.extend({
  layout: layout,
  block: null,
  actions: {
    removeOffering(offering) {
      this.sendAction('removeOffering', offering);
    },
  }
});
