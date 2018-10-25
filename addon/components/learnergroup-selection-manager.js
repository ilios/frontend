/* eslint ember/order-in-components: 0 */
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import layout from '../templates/components/learnergroup-selection-manager';

export default Component.extend({
  layout,
  intl: service(),
  classNames: ['learnergroup-selection-manager'],
  filter: '',
  cohorts: null,
  learnerGroups: null,
  'data-test-learnergroup-selection-manager': true,
});
