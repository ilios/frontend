/* eslint ember/order-in-components: 0 */
import Component from '@ember/component';

export default Component.extend({
  label: null,
  yes: false,
  tagName: 'span',
  classNames: ['switch', 'yes-no', 'switch-green'],
  click(){
    const yes = this.get('yes');
    this.get('toggle')(!yes);
  }
});
