import { create, visitable } from 'ember-cli-page-object';
import details from './components/curriculum-inventory/report-details';
import rollover from './components/curriculum-inventory/report-rollover';

export default create({
  visit: visitable('/curriculum-inventory-reports/:reportId/rollover'),
  details,
  rollover,
});
