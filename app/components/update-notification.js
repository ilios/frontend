/* eslint ember/order-in-components: 0 */
import Component from '@ember/component';

export default Component.extend({
  classNames: ['update-notification'],
  click() {
    window.location.reload();
  }
});
