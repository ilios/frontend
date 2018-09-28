/* eslint ember/order-in-components: 0 */
import Component from '@ember/component';
import layout from '../templates/components/leadership-manager';

export default Component.extend({
  layout,
  classNames: ['leadership-manager'],
  directors: null,
  administrators: null,
  showDirectors: true,
  showAdministrators: true,
  'data-test-leadership-manager': true,
});
