/* eslint ember/order-in-components: 0 */
import Row from 'ember-light-table/components/lt-row';

export default Row.extend({
  classNameBindings: ['row.confirmDelete:confirm-removal'],
});