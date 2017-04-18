import Ember from 'ember';

const { Component } = Ember;

export default Component.extend({
  classNames: ['click-choice-buttons'],
  firstChoicePicked: true,

  buttonContent1: null,
  buttonContent2: null,

  actions: {
    clickFirstButton(){
      const firstChoicePicked = this.get('firstChoicePicked');
      const toggle = this.get('toggle');
      if (!firstChoicePicked) {
        toggle(true);
      }
    },
    clickSecondButton(){
      const firstChoicePicked = this.get('firstChoicePicked');
      const toggle = this.get('toggle');
      if (firstChoicePicked) {
        toggle(false);
      }
    }
  }
});
