/* eslint ember/order-in-components: 0 */
import Component from '@ember/component';

export default Component.extend({
  tagName: 'section',
  classNames: ['program-details'],
  program: null,
  canUpdate: false,
});
