import { clickable, create, text, visitable } from 'ember-cli-page-object';

import leadershipCollapsed from 'ilios-common/page-objects/components/leadership-collapsed';
import leadershipList from 'ilios-common/page-objects/components/leadership-list';
import leadershipManager from 'ilios-common/page-objects/components/leadership-manager';
import overview from './components/program/overview';
import header from './components/program/header';

export default create({
  scope: '[data-test-program-details]',
  visit: visitable('/programs/:programId'),
  header,
  overview,
  leadershipCollapsed,
  leadershipExpanded: {
    scope: '[data-test-program-leadership-expanded]',
    title: text('.title'),
    manage: clickable('.actions button'),
    save: clickable('.actions button.bigadd'),
    cancel: clickable('.actions button.bigcancel'),
    leadershipList,
    leadershipManager,
  },
});
