/* eslint ember/order-in-components: 0 */
import Component from '@ember/component';

export default Component.extend({
  classNames: ['clickable', 'link', 'session-table-expand'],
  click(){
    const row = this.get('row');
    row.set('expanded', !row.get('expanded'));
  }
});
