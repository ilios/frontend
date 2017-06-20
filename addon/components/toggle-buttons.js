import Ember from 'ember';
import layout from '../templates/components/toggle-buttons';

const { Component } = Ember;

export default Component.extend({
  layout,
  classNames: ['toggle-buttons'],
  firstOptionSelected: true,

  firstLabel: null,
  secondLabel: null,

  actions: {
    clickFirstButton(){
      const firstOptionSelected = this.get('firstOptionSelected');
      const toggle = this.get('toggle');
      if (!firstOptionSelected) {
        toggle(true);
      }
    },
    clickSecondButton(){
      const firstOptionSelected = this.get('firstOptionSelected');
      const toggle = this.get('toggle');
      if (firstOptionSelected) {
        toggle(false);
      }
    }
  }
});
