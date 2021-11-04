import { create, visitable } from 'ember-cli-page-object';

import details from './components/course-details';
import publicationcheck from './components/course-publicationcheck';

export default create({
  visit: visitable('/courses/:courseId/publicationcheck'),
  details,
  publicationcheck,
  backToCourse: {
    scope: '[data-test-back-to-course]',
  },
});
