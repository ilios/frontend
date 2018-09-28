/* eslint ember/order-in-components: 0 */
import Component from '@ember/component';
import layout from '../templates/components/click-choice-buttons';

export default Component.extend({
  layout,
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
    clickSecondButton() {
      const firstChoicePicked = this.get('firstChoicePicked');
      const toggle = this.get('toggle');
      if (firstChoicePicked) {
        toggle(false);
      }
    }
  }
});
