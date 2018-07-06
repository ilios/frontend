/* eslint ember/order-in-components: 0 */
import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
  session: service(),
  classNames: ['ilios-header'],
  tagName: 'header',
  ariaRole: 'banner',
  title: null,
});
