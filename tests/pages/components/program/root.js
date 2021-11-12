import { create } from 'ember-cli-page-object';
import leadershipCollapsed from 'ilios-common/page-objects/components/leadership-collapsed';
import overview from './overview';
import header from './header';
import leadershipExpanded from './leadership-expanded';

const definition = {
  scope: '[data-test-program-details]',
  header,
  overview,
  leadershipCollapsed,
  leadershipExpanded,
};

export default definition;
export const component = create(definition);
