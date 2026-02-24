import { clickable, create, fillable, text } from 'ember-cli-page-object';

import newSession from '../new-session';
import sessionsGrid from '../sessions-grid';
import sessionsGridHeaderRow from '../sessions-grid-header-row';

const definition = {
  scope: '[data-test-course-sessions]',
  header: {
    scope: '[data-test-course-sessions-header]',
    title: text('[data-test-title]'),
    expandNewSessionForm: clickable(
      '[data-test-actions] [data-test-expand-collapse-button] button',
    ),
  },
  newSavedSession: {
    scope: '[data-test-new-saved-session] a',
  },
  filter: fillable('[data-test-session-filter]'),
  newSession,
  sessionsGridHeaderRow,
  sessionsGrid,
};

export default definition;
export const component = create(definition);
