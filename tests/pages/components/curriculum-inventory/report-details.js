import { clickable, create, text } from 'ember-cli-page-object';

import header from './report-header';
import overview from './report-overview';
import leadershipExpanded from './leadership-expanded';
import leadershipCollapsed from 'ilios-common/page-objects/components/leadership-collapsed';

const definition = {
  scope: '[data-test-curriculum-inventory-report-details]',
  header,
  finalizeConfirmation: {
    scope: '[data-test-confirm-finalize]',
    message: text('[data-test-message]'),
    confirm: clickable('[data-test-finalize]'),
    cancel: clickable('[data-test-cancel]'),
  },
  overview,
  leadershipExpanded,
  leadershipCollapsed,
};

export default definition;
export const component = create(definition);
