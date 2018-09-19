/* eslint ember/order-in-components: 0 */
import Component from '@ember/component';

export default Component.extend({
  classNames: ['learning-material-table-title', 'link'],
  click() {
    const row = this.row;
    const manageMaterial = this.get('tableActions.manageMaterial');
    manageMaterial(row.get('content'));
  }
});
