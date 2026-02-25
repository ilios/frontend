import { create, visitable } from 'ember-cli-page-object';

import details from './components/course/details';
import backToCourses from './components/course/back-to-courses';

export default create({
  visit: visitable('/courses/:courseId'),
  backToCourses,
  details,
});
