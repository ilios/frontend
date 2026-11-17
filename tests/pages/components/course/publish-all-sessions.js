import { create, visitable } from 'ember-cli-page-object';

import coursePage from '../../sessions';
import publishAllSessions from '../publish-all-sessions';
import overview from '../session/overview';
import details from './details';
import courseSessions from './sessions';

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
