import {
  clickable,
  create,
  fillable,
  visitable
} from 'ember-cli-page-object';

import sessionsList from 'ilios/tests/pages/components/sessions-grid';

export default create({
  visit: visitable('/courses/:courseId'),
  scope: '[data-test-course-sessions]',
  expandCollapseAllSessions: clickable('[data-test-sessions-grid-header] [data-test-expand-collapse-all]'),
  expandNewSessionForm: clickable('[data-test-actions] [data-test-expand-collapse-button]'),
  newSession: {
    scope: '[data-test-new-session]',
    title: fillable('[data-test-title]'),
    type: fillable('[data-test-type]'),
    save: clickable('[data-test-save]'),
    cancel: clickable('[data-test-cancel]'),
  },
  newSavedSession: {
    scope: '[data-test-new-saved-session] a'
  },
  filter: fillable('[data-test-session-filter]'),
  sessionsList,
});
