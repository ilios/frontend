import { create, visitable } from 'ember-cli-page-object';

import leadershipCollapsed from 'ilios-common/page-objects/components/leadership-collapsed';
import overview from './components/program/overview';
import header from './components/program/header';
import leadershipExpanded from './components/program/leadership-expanded';

export default create({
  scope: '[data-test-program-details]',
  visit: visitable('/programs/:programId'),
  header,
  overview,
  leadershipCollapsed,
  leadershipExpanded,
});
