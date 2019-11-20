import { inject as service } from '@ember/service';
import Component from '@ember/component';

export default Component.extend({
  intl: service(),
  classNames: ['learnergroup-selection-manager'],
  filter: '',
  cohorts: null,
  learnerGroups: null,
  'data-test-learnergroup-selection-manager': true,
});
