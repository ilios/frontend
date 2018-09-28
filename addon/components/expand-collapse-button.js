/* eslint ember/order-in-components: 0 */
import Component from '@ember/component';
import layout from '../templates/components/expand-collapse-button';

export default Component.extend({
  layout,
  classNames: ['expand-collapse-button'],
  'data-test-expand-collapse-button': true,

  value: false,

  click() {
    this.sendAction();
  }
});
