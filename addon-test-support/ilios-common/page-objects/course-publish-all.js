import { create, isVisible, visitable } from 'ember-cli-page-object';

import objectives from './components/course/objectives';

export default create({
  visit: visitable('/courses/:courseId/publishall'),
  course: {
    scope: '[data-test-ilios-course-details]',
    objectives,
  },
  publishAll: {
    scope: '[data-test-publish-all-sessions]',
    hasUnlinkedWarning: isVisible('[data-test-unlinked-warning]'),
  },
});
