/* eslint ember/order-in-components: 0 */
import Component from '@ember/component';
import layout from '../templates/components/collapsed-taxonomies';

export default Component.extend({
  layout,
  tagName: 'section',
  classNames: ['collapsed-taxonomies'],
  subject: null,
  'data-test-collapsed-taxonomies': true,
});
