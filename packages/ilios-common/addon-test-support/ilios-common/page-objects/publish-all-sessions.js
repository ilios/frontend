import { create, visitable } from 'ember-cli-page-object';

import overview from './components/session-overview';
import publishAllSessions from './components/publish-all-sessions';

export default create({
  visit: visitable('/courses/:courseId/publishall'),
  overview,
  backToCourse: {
    scope: '[data-test-back-to-course]',
  },
  publishAllSessions,
});
