import Ember from 'ember';

const { Component } = Ember;

export default Component.extend({
  multiModeSupported: false,
  fillModeSupported: false,
  singleMode: true,
  tagName: 'section',
  classNames: ['new-learnergroup', 'new-result', 'form-container'],

  actions: {
    setMode(value) {
      this.set('singleMode', value);
    },
    generateNewLearnerGroups(num){
      this.sendAction('generateNewLearnerGroups', num);
    }
  }
});
