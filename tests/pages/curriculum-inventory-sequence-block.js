import { create, visitable } from 'ember-cli-page-object';

import blocks from 'ilios/tests/pages/components/curriculum-inventory/sequence-block-list';
import overview from 'ilios/tests/pages/components/curriculum-inventory/sequence-block-overview';

export default create({
  visit: visitable('/curriculum-inventory-sequence-block/:blockId'),
  details: {
    scope: '[data-test-curriculum-inventory-sequence-block-details]',
    overview,
    // @todo implement [ST 2019/07/23]
  },
  blocks,
});
