import { create, visitable } from 'ember-cli-page-object';
import details from './components/curriculum-inventory/report-details';
import blocks from './components/curriculum-inventory/sequence-block-list';

export default create({
  visit: visitable('/curriculum-inventory-reports/:reportId'),
  details,
  blocks,
});
