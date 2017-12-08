/* eslint ember/order-in-components: 0 */
import { inject as service } from '@ember/service';
import Component from '@ember/component';

export default Component.extend({
  i18n: service(),
  classNames: ['learnergroup-selection-manager'],
  filter: '',
  cohorts: null,
  learnerGroups: null,
});
