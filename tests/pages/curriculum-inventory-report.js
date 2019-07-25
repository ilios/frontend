import {
  clickable,
  create,
  text,
  visitable
} from 'ember-cli-page-object';

import leadershipCollapsed from 'ilios-common/page-objects/components/leadership-collapsed';
import leadershipList from 'ilios-common/page-objects/components/leadership-list';
import leadershipManager from 'ilios-common/page-objects/components/leadership-manager';
import blocks from 'ilios/tests/pages/components/curriculum-inventory-sequence-block-list';


export default create({
  visit: visitable('/curriculum-inventory-reports/:reportId'),

  details: {
    scope: '[data-test-curriculum-inventory-report-details]',
    leadershipCollapsed,
    leadershipExpanded: {
      scope: '[data-test-curriculum-inventory-leadership-expanded]',
      title: text('.title'),
      manage: clickable('.actions button'),
      save: clickable('.actions button.bigadd'),
      cancel: clickable('.actions button.bigcancel'),
      leadershipList,
      leadershipManager,
    },
  },
  blocks
});
