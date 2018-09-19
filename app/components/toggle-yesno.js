/* eslint ember/order-in-components: 0 */
import Component from '@ember/component';

export default Component.extend({
  label: null,
  yes: false,
  tagName: 'span',
  classNames: ['toggle-yesno'],
  'data-test-toggle-yesno': true,
  click(){
    const yes = this.yes;
    this.toggle(!yes);
  }
});
