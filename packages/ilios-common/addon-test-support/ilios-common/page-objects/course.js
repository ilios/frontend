import { create, visitable } from 'ember-cli-page-object';

import details from './components/course-details';

export default create({
  visit: visitable('/courses/:courseId'),
  backToCourseLink: {
    scope: '[data-test-back-to-courses]',
  },
  details,
});
