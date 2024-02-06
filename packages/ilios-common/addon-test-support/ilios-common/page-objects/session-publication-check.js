import { create, text, visitable } from 'ember-cli-page-object';

import overview from './components/session-overview';

export default create({
  visit: visitable('/courses/:courseId/sessions/:sessionId/publicationcheck'),
  overview,
  backToSession: {
    scope: '[data-test-back-to-session]',
  },
  title: text('[data-test-title]'),
  sessionTitle: text('[data-test-session-title]'),
  offerings: text('[data-test-offerings]'),
  terms: text('[data-test-terms]'),
  objectives: text('[data-test-objectives]'),
  unlink: {
    scope: '[data-test-unlink]',
  },
  mesh: text('[data-test-mesh]'),
});
