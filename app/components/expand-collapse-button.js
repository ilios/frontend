/* eslint ember/order-in-components: 0 */
import Component from '@ember/component';

export default Component.extend({
  classNames: ['expand-collapse-button'],

  value: false,

  click() {
    this.sendAction();
  }
});
