/* eslint ember/order-in-components: 0 */
import Component from '@ember/component';
import layout from '../templates/components/session-publicationcheck';

export default Component.extend({
  layout,
  classNames: ['session-publicationcheck'],
  session: null,
});
