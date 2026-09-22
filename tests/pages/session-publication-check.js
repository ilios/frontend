import { create, visitable } from 'ember-cli-page-object';

import overview from './components/session/overview';
import publicationcheck from './components/session-publicationcheck';

export default create({
  visit: visitable('/courses/:courseId/sessions/:sessionId/publicationcheck'),
  overview,
  publicationcheck,
});
