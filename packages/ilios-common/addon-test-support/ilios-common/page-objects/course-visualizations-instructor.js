import { create, visitable } from 'ember-cli-page-object';
import root from './components/course-visualize-instructor';

export default create({
  visit: visitable('/data/courses/:courseId/instructors/:userId'),
  root,
});
