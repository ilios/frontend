/* eslint ember/order-in-components: 0 */
import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  tagName: 'div',
  classNames: ['pre-fill'],
  lines: 4,
  linesMinusOne: computed('lines', function(){
    return parseInt(this.get('lines'), 10)-1;
  }),
});
