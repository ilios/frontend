import { create, visitable } from 'ember-cli-page-object';

import materials from './components/course/materials';
import summaryHeader from './components/course/summary-header';

export default create({
  visit: visitable('/courses/:courseId/materials'),
  backToCourse: {
    scope: '[data-test-back-to-course]',
  },
  summaryHeader,
  materials,
});
