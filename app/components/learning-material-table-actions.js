/* eslint ember/order-in-components: 0 */
import Component from '@ember/component';

export default Component.extend({
  classNames: ['learning-material-table-actions'],
  actions: {
    clickTrash() {
      const row = this.get('row');
      row.set('expanded', true);
      row.set('confirmDelete', true);
    }
  }
});
