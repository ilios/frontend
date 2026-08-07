import { create, text, visitable } from 'ember-cli-page-object';
import details from './components/session-details';

export default create({
  visit: visitable('/courses/:courseId/sessions/:sessionId'),
  courseAndStatus: {
    scope: '[data-test-course-and-status]',
    course: text('[data-test-course]'),
    status: text('[data-test-status]'),
  },
  backToSessions: {
    scope: '[data-test-back-to-sessions]',
  },
  details,
});
