/* eslint ember/order-in-components: 0 */
import Component from '@ember/component';

export default Component.extend({
  classNames: ['leadership-manager'],
  directors: null,
  administrators: null,
  showDirectors: true,
  showAdministrators: true,
  'data-test-leadership-manager': true,
});
