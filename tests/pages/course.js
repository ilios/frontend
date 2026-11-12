import { create, visitable } from 'ember-cli-page-object';

import backToCourses from './components/course/back-to-courses';
import details from './components/course/details';

export default create({
  visit: visitable('/courses/:courseId'),
  backToCourses,
  details,
});
