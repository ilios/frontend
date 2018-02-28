import Component from '@ember/component';
import layout from '../templates/components/toggle-buttons';

export default Component.extend({
  layout,
  classNames: ['toggle-buttons'],
  tagName: 'span',
  firstOptionSelected: true,

  firstLabel: null,
  secondLabel: null,

  actions: {
    firstChoice(){
      const firstOptionSelected = this.get('firstOptionSelected');
      const toggle = this.get('toggle');
      if (!firstOptionSelected) {
        toggle(true);
      }
    },
    secondChoice(){
      const firstOptionSelected = this.get('firstOptionSelected');
      const toggle = this.get('toggle');
      if (firstOptionSelected) {
        toggle(false);
      }
    }
  }
});
