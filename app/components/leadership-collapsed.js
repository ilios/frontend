/* eslint ember/order-in-components: 0 */
import Component from '@ember/component';

export default Component.extend({
  administratorsCount: null,
  directorsCount: null,
  tagName: 'section',
  classNames: ['leadership-collapsed'],
  'data-test-leadership-collapsed': true,
});
