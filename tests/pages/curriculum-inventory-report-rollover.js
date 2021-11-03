import { create, visitable } from 'ember-cli-page-object';
import details from 'ilios/tests/pages/components/curriculum-inventory/report-details';
import rollover from 'ilios/tests/pages/components/curriculum-inventory/report-rollover';

export default create({
  visit: visitable('/curriculum-inventory-reports/:reportId/rollover'),
  details,
  rollover,
});
