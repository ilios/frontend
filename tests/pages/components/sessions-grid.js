import { clickable, create, collection, text } from 'ember-cli-page-object';
import offerings from './sessions-grid-offering-table';
import row from './sessions-grid-session-row';

const definition = {
  scope: '[data-test-sessions-grid]',
  sessions: collection('[data-test-session]', {
    row,
    offerings,
    noOfferings: text('[data-test-no-offerings]'),
    confirm: clickable('[data-test-confirm-removal] [data-test-yes]'),
  }),
  expandedSessions: collection('[data-test-expanded-session]', {
    lastUpdated: text('.sessions-grid-last-updated'),
  }),
  noResults: {
    scope: '[data-test-no-results]',
  },
};

export default definition;
export const component = create(definition);
