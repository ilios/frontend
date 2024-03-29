import { create, visitable } from 'ember-cli-page-object';
import reports from 'frontend/tests/pages/components/curriculum-inventory/reports';

export default create({
  visit: visitable('/curriculum-inventory-reports'),
  reports,
});
