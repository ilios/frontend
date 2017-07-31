import Ember from 'ember';

const { Component } = Ember;

export default Component.extend({
  classNames: ['checkbox'],

  tagName: 'span',

  value: false,

  click() {
    return false;
  }
});
