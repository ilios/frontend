import { create, visitable } from 'ember-cli-page-object';
import details from './components/session-details';

export default create({
  visit: visitable('/courses/:courseId/sessions/:sessionId'),
  backToSessions: {
    scope: '[data-test-back-to-sessions]',
  },
  details,
});
