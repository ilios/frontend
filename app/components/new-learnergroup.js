import Ember from 'ember';

const { Component } = Ember;

export default Component.extend({
  multiModeSupported: false,
  singleMode: true,
  tagName: 'section',
  classNames: ['new-learnergroup', 'new-result', 'form-container'],

  actions: {
    setMode(value) {
      this.set('singleMode', value);
    },
    cancel(){
      this.sendAction('cancel');
    },
    save(title){
      this.sendAction('save', title);
    },
    generateNewLearnerGroups(num){
      this.sendAction('generateNewLearnerGroups', num);
    }
  }
});
