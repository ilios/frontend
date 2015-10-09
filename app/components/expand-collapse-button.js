import Ember from 'ember';

const { Component } = Ember;

export default Component.extend({
  value: false,

  click() {
    this.sendAction();
  }
});
