/* eslint ember/order-in-components: 0 */
import Component from '@ember/component';

export default Component.extend({
  classNames: ['checkbox'],

  tagName: 'span',

  value: false,

  click() {
    return false;
  }
});
