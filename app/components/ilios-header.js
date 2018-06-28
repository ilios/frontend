/* eslint ember/order-in-components: 0 */
import { inject as service } from '@ember/service';
import Component from '@ember/component';

export default Component.extend({
  session: service(),
  currentUser: service(),
  classNames: ['ilios-header'],
  tagName: 'header',
  ariaRole: 'banner',
  title: null,
});
