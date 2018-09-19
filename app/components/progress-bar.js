/* eslint ember/order-in-components: 0 */
import Component from '@ember/component';
import { computed } from '@ember/object';
import { htmlSafe } from '@ember/string';

export default Component.extend({
  classNames: ['progress-bar'],
  percentage: 0,
  widthStyle: computed('percentage', function(){
    const percentage = this.percentage;
    const str = `width: ${percentage}%`;

    return htmlSafe(str);
  }),
});
