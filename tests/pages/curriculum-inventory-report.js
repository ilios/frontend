import {
  clickable,
  create,
  text,
  visitable
} from 'ember-cli-page-object';

import leadershipCollapsed from 'ilios-common/page-objects/components/leadership-collapsed';
import leadershipList from 'ilios-common/page-objects/components/leadership-list';
import leadershipManager from 'ilios-common/page-objects/components/leadership-manager';

export default create({
  scope: '[data-test-curriculum-inventory-report-details]',
  visit: visitable('/curriculum-inventory-reports/:reportId'),

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
});
