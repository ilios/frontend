import { create, visitable } from 'ember-cli-page-object';

import courseSessions from './sessions';
import coursePage from '../../sessions';
import overview from '../session/overview';
import details from './details';
import publishAllSessions from '../publish-all-sessions';

export default create({
  visit: visitable('/courses/:courseId/publishall'),
  coursePage,
  courseSessions,
  overview,
  backToCourse: {
    scope: '[data-test-back-to-course]',
  },
  details,
  publishAllSessions,
});
