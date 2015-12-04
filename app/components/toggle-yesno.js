import Ember from 'ember';

const { Component } = Ember;

export default Component.extend({
  label: null,
  yes: false,
  click(){
    this.sendAction();
  }
});
