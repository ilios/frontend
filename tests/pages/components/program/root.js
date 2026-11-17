import { clickable, create } from 'ember-cli-page-object';
import leadershipCollapsed from 'frontend/tests/pages/components/leadership-collapsed';
import leadershipExpanded from 'frontend/tests/pages/components/leadership-expanded';

import header from './header';
import overview from './overview';

const definition = {
  scope: '[data-test-program-details]',
  goBack: clickable('[data-test-back-link]'),
  header,
  overview,
  leadershipCollapsed,
  leadershipExpanded,
};

export default definition;
export const component = create(definition);
