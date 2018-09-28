/* eslint ember/order-in-components: 0 */
import Component from '@ember/component';
import { computed } from '@ember/object';
import { htmlSafe } from '@ember/string';
import layout from '../templates/components/progress-bar';

export default Component.extend({
  layout,
  classNames: ['progress-bar'],
  percentage: 0,
  widthStyle: computed('percentage', function(){
    const percentage = this.get('percentage');
    const str = `width: ${percentage}%`;

    return htmlSafe(str);
  }),
});
