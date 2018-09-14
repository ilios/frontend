/* eslint ember/order-in-components: 0 */
import Component from '@ember/component';
import layout from '../templates/components/toggle-yesno';

export default Component.extend({
  layout,
  label: null,
  yes: false,
  tagName: 'span',
  classNames: ['toggle-yesno'],
  'data-test-toggle-yesno': true,
  click(){
    const yes = this.get('yes');
    this.get('toggle')(!yes);
  }
});
