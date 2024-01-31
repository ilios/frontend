import { create, visitable } from 'ember-cli-page-object';
import details from 'frontend/tests/pages/components/curriculum-inventory/report-details';
import blocks from 'frontend/tests/pages/components/curriculum-inventory/sequence-block-list';

export default create({
  visit: visitable('/curriculum-inventory-reports/:reportId'),
  details,
  blocks,
});
