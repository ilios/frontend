import Ember from 'ember';

const { Component } = Ember;

export default Component.extend({
  classNames: ['toggle-onoff'],

  lable: null,
  on: false,

  click() {
    this.sendAction();
  }
});
