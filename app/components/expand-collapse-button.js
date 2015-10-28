import Ember from 'ember';

const { Component } = Ember;

export default Component.extend({
  classNames: ['expand-collapse-button'],

  value: false,

  click() {
    this.sendAction();
  }
});
