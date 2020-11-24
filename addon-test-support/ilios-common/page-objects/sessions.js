import {
  clickable,
  create,
  fillable,
  hasClass,
  visitable
} from 'ember-cli-page-object';

import sessionsList from './components/sessions-grid';
import newSession  from './components/new-session';

export default create({
  visit: visitable('/courses/:courseId'),
  scope: '[data-test-course-sessions]',
  expandCollapseAllSessions: clickable('[data-test-sessions-grid-header] [data-test-expand-collapse-all]'),
  showsAllSessionsExpanded: hasClass('fa-caret-down', '[data-test-expand-all] svg'),
  expandNewSessionForm: clickable('[data-test-actions] [data-test-expand-collapse-button] button'),
  newSession,
  newSavedSession: {
    scope: '[data-test-new-saved-session] a'
  },
  filter: fillable('[data-test-session-filter]'),
  sessionsList,
});
