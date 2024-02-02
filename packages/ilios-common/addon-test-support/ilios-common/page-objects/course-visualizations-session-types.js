import { create, visitable } from 'ember-cli-page-object';
import root from './components/course-visualize-session-types';

export default create({
  visit: visitable('/data/courses/:courseId/session-types'),
  root,
});
