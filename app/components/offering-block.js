/* eslint ember/order-in-components: 0 */
import Component from '@ember/component';
import layout from '../templates/components/offering-block';

export default Component.extend({
  layout: layout,
  block: null,
  actions: {
    removeOffering(offering) {
      this.sendAction('removeOffering', offering);
    },
  }
});
