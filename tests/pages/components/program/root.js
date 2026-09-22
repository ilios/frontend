import { clickable, create } from 'ember-cli-page-object';
import leadershipCollapsed from 'ilios-common/page-objects/components/leadership-collapsed';
import overview from './overview';
import header from './header';
import leadershipExpanded from 'ilios-common/page-objects/components/leadership-expanded';

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
